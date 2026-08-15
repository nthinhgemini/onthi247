import {
  Controller,
  Post,
  Body,
  HttpCode,
  Get,
  UseGuards,
  Req,
  Res,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import {
  RegisterDto,
  LoginDto,
  RefreshDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  VerifyTokenDto,
} from './dto/auth.dto';
import { Public } from './decorators';
import { GoogleAuthGuard } from './google-auth.guard';
import type { AuthResponse } from './auth.types';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @Post('login')
  @HttpCode(200)
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Public()
  @Post('refresh')
  @HttpCode(200)
  refresh(@Body() dto: RefreshDto) {
    return this.authService.refresh(dto.refresh_token);
  }

  @Public()
  @Get('google')
  @UseGuards(GoogleAuthGuard)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  googleAuth(@Req() _req: Request) {
    // Passport xử lý redirect tới Google
  }

  @Public()
  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  googleAuthCallback(
    @Req() req: Request & { user: AuthResponse },
    @Res() res: Response,
  ) {
    const frontendUrl =
      process.env.FRONTEND_URL?.split(',')[0]?.trim() ??
      'http://localhost:3000';
    const url = new URL('/auth/callback', frontendUrl.replace(/\/+$/, ''));

    // Set HttpOnly cookies cho security
    res.cookie('access_token', req.user.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000,
    });
    res.cookie('refresh_token', req.user.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    url.searchParams.set('access_token', req.user.access_token);
    url.searchParams.set('refresh_token', req.user.refresh_token);
    return res.redirect(url.toString());
  }

  /** Endpoint test/dev: mô phỏng profile Google trả về từ OAuth (chỉ bật khi MAILER_MOCK=true). */
  @Public()
  @Post('google/mock')
  googleMock(
    @Body()
    body: {
      googleId: string;
      email?: string;
      fullName?: string;
      avatarUrl?: string | null;
    },
  ) {
    if (process.env.MAILER_MOCK !== 'true') {
      return { message: 'Không khả dụng ở production' };
    }
    return this.authService.validateGoogleUser({
      googleId: body.googleId,
      email: body.email ?? '',
      fullName: body.fullName ?? 'Google User',
      avatarUrl: body.avatarUrl ?? null,
    });
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(200)
  forgotPassword(@Body() dto: ForgotPasswordDto, @Req() req: Request) {
    const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
    return this.authService.forgotPassword(dto.email, ip);
  }

  @Public()
  @Post('verify-reset-token')
  @HttpCode(200)
  verifyResetToken(@Body() dto: VerifyTokenDto) {
    return this.authService.verifyResetToken(dto.token);
  }

  @Public()
  @Post('reset-password')
  @HttpCode(200)
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.token, dto.password);
  }
}
