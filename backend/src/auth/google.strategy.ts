import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile, VerifyCallback } from 'passport-google-oauth20';
import { AuthService } from './auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly authService: AuthService) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID ?? 'dev-google-client-id',
      clientSecret:
        process.env.GOOGLE_CLIENT_SECRET ?? 'dev-google-client-secret',
      callbackURL:
        process.env.GOOGLE_CALLBACK_URL ??
        'http://localhost:3001/api/auth/google/callback',
      scope: ['email', 'profile'],
      state: true,
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): Promise<void> {
    const email = profile.emails?.[0]?.value?.toLowerCase() ?? '';
    const googleId = profile.id;
    const avatarUrl =
      profile.photos?.[1]?.value ?? profile.photos?.[0]?.value ?? null;
    try {
      const user = await this.authService.validateGoogleUser({
        googleId,
        email,
        fullName:
          profile.displayName || profile.name?.givenName || 'Google User',
        avatarUrl,
      });
      done(null, user);
    } catch (err) {
      done(err as Error);
    }
  }
}
