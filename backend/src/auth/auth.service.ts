import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  token_version?: number;
}

export interface GoogleProfileInput {
  googleId: string;
  email: string;
  fullName: string;
  avatarUrl?: string | null;
}

const RESET_TOKEN_TTL_MS = 15 * 60 * 1000; // 15 phút theo spec

@Injectable()
export class AuthService {
  private readonly forgotPasswordRequests = new Map<string, number[]>();
  private readonly forgotPasswordIpRequests = new Map<string, number[]>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly mail: MailService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException('Email đã được đăng ký');
    }
    const password_hash = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password_hash,
        full_name: dto.full_name,
        role: dto.role ?? 'student',
      },
    });
    return this.buildAuthResponse(user);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }
    if (!user.password_hash) {
      throw new UnauthorizedException(
        'Tài khoản này đăng nhập bằng Google. Hãy dùng "Quên mật khẩu" để đặt mật khẩu.',
      );
    }
    if (!(await bcrypt.compare(dto.password, user.password_hash))) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }
    if (user.is_active === false) {
      throw new UnauthorizedException('Tài khoản đã bị khóa');
    }
    return this.buildAuthResponse(user);
  }

  /** Đăng nhập/liên kết qua Google: đã có google_id/oauth_id → vào; có email → link; else tạo mới. */
  async validateGoogleUser(input: GoogleProfileInput) {
    if (!input.email) {
      throw new UnauthorizedException('Tài khoản Google thiếu email');
    }
    const normalizedEmail = input.email.toLowerCase();

    const byGoogle = input.googleId
      ? await this.prisma.user.findFirst({
          where: {
            OR: [
              { google_id: input.googleId },
              { oauth_id: input.googleId, oauth_provider: 'google' },
            ],
          },
        })
      : null;

    if (byGoogle) {
      if (byGoogle.is_active === false) {
        throw new UnauthorizedException('Tài khoản đã bị khóa');
      }
      return this.buildAuthResponse(byGoogle);
    }

    const byEmail = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (byEmail) {
      if (byEmail.is_active === false) {
        throw new UnauthorizedException('Tài khoản đã bị khóa');
      }
      if (byEmail.oauth_provider && byEmail.oauth_provider !== 'google') {
        throw new ConflictException(
          `Tài khoản đã liên kết với nhà cung cấp ${byEmail.oauth_provider}`,
        );
      }

      const linked = await this.prisma.user.update({
        where: { id: byEmail.id },
        data: {
          google_id: input.googleId || undefined,
          oauth_provider: 'google',
          oauth_id: input.googleId || undefined,
        },
      });
      return this.buildAuthResponse(linked);
    }

    const created = await this.prisma.user.create({
      data: {
        email: normalizedEmail,
        full_name: input.fullName,
        avatar_url: input.avatarUrl,
        google_id: input.googleId || undefined,
        oauth_provider: 'google',
        oauth_id: input.googleId || undefined,
        role: 'student',
      },
    });
    return this.buildAuthResponse(created);
  }

  /** Tạo token reset mật khẩu, gửi email (rate limit 3 reqs / email / hour & 10 reqs / IP / hour). */
  async forgotPassword(
    email: string,
    clientIp?: string,
  ): Promise<{ message: string; dev_reset_token?: string }> {
    const normalized = (email || '').toLowerCase().trim();
    const generic = {
      message:
        'Nếu email tồn tại, chúng tôi đã gửi đường dẫn đặt lại mật khẩu.',
    };

    if (!normalized) {
      return generic;
    }

    const now = Date.now();
    const oneHour = 60 * 60 * 1000;

    // Rate limiting theo IP: tối đa 10 request / IP / 1 giờ (chống brute-force / dò email hàng loạt)
    if (clientIp) {
      const ipHistory = (
        this.forgotPasswordIpRequests.get(clientIp) ?? []
      ).filter((ts) => now - ts < oneHour);

      if (ipHistory.length >= 10) {
        throw new BadRequestException(
          'Địa chỉ IP này đã gửi quá 10 yêu cầu trong 1 giờ. Vui lòng thử lại sau.',
        );
      }
      ipHistory.push(now);
      this.forgotPasswordIpRequests.set(clientIp, ipHistory);
    }

    // Rate limiting theo email: tối đa 3 request / email / 1 giờ
    const history = (this.forgotPasswordRequests.get(normalized) ?? []).filter(
      (ts) => now - ts < oneHour,
    );

    if (history.length >= 3) {
      throw new BadRequestException(
        'Bạn đã yêu cầu quá 3 lần trong 1 giờ. Vui lòng thử lại sau.',
      );
    }

    history.push(now);
    this.forgotPasswordRequests.set(normalized, history);

    const user = await this.prisma.user.findUnique({
      where: { email: normalized },
    });
    if (!user) return generic;

    const rawToken = crypto.randomBytes(32).toString('hex');
    const token_hash = this.hashToken(rawToken);

    await this.prisma.passwordResetToken.create({
      data: {
        user_id: user.id,
        token_hash,
        expires_at: new Date(Date.now() + RESET_TOKEN_TTL_MS),
      },
    });

    await this.mail.send({
      to: user.email,
      subject: 'Đặt lại mật khẩu Ôn thi 2029',
      html: this.resetEmailHtml(
        user.full_name,
        `${process.env.FRONTEND_URL ?? 'http://localhost:3000'}/reset-password?token=${rawToken}`,
      ),
    });

    if (process.env.MAILER_MOCK === 'true') {
      return { message: generic.message, dev_reset_token: rawToken };
    }
    return generic;
  }

  async verifyResetToken(token: string) {
    await this.findValidToken(token);
    return { valid: true };
  }

  async resetPassword(token: string, newPassword: string) {
    const record = await this.findValidToken(token);

    const password_hash = await bcrypt.hash(newPassword, 10);
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: record.user_id },
        data: {
          password_hash,
          token_version: { increment: 1 }, // Invalidate all existing refresh tokens
        },
      }),
      this.prisma.passwordResetToken.update({
        where: { id: record.id },
        data: { used_at: new Date() },
      }),
    ]);
    return { message: 'Mật khẩu đã được đặt lại thành công' };
  }

  private async findValidToken(token: string) {
    const record = await this.prisma.passwordResetToken.findUnique({
      where: { token_hash: this.hashToken(token) },
    });
    if (!record || record.used_at) {
      throw new BadRequestException('Token không hợp lệ hoặc đã được sử dụng');
    }
    if (record.expires_at.getTime() < Date.now()) {
      throw new BadRequestException('Token đã hết hạn');
    }
    return record;
  }

  private hashToken(token: string) {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  private resetEmailHtml(name: string, url: string) {
    return `
<div style="font-family:system-ui,sans-serif;max-width:560px;margin:auto">
  <h2 style="color:#4f46e5">Đặt lại mật khẩu — Ôn thi 2029</h2>
  <p>Chào <strong>${name}</strong>,</p>
  <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.
     Nhấn vào nút bên dưới để tạo mật khẩu mới (hiệu lực 15 phút):</p>
  <a href="${url}"
     style="display:inline-block;background:#4f46e5;color:#fff;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:600">
     Đặt lại mật khẩu
  </a>
  <p style="color:#6b7280;font-size:13px;margin-top:24px">
    Nếu bạn không yêu cầu, hãy bỏ qua email này.
  </p>
</div>`;
  }

  async refresh(refreshToken: string) {
    let payload: JwtPayload;
    try {
      payload = await this.jwt.verifyAsync<JwtPayload>(refreshToken);
    } catch {
      throw new UnauthorizedException('Refresh token không hợp lệ');
    }
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });
    if (!user) {
      throw new UnauthorizedException('Người dùng không tồn tại');
    }
    if (user.is_active === false) {
      throw new UnauthorizedException('Tài khoản đã bị khóa');
    }
    if (
      payload.token_version !== undefined &&
      payload.token_version !== user.token_version
    ) {
      throw new UnauthorizedException(
        'Refresh token đã bị thu hồi (vui lòng đăng nhập lại)',
      );
    }
    return this.buildAuthResponse(user);
  }

  private async buildAuthResponse(user: {
    id: string;
    email: string;
    role: string;
    full_name: string;
    token_version?: number;
  }) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      token_version: user.token_version ?? 0,
    };
    return {
      access_token: await this.jwt.signAsync(payload),
      refresh_token: await this.jwt.signAsync(payload, {
        expiresIn: '7d',
      }),
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        full_name: user.full_name,
      },
    };
  }
}
