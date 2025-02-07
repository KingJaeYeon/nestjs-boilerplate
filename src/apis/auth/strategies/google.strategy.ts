import { Strategy, Profile } from 'passport-google-oauth20';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { GOOGLE } from '@/common/config';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '@/apis/auth/auth.service';
import { IOAuth } from '@/apis/auth/interfaces';
import { Provider } from '@prisma/client';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, GOOGLE) {
  constructor(
    configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      clientID: configService.get('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.get('GOOGLE_CALLBACK'),
      scope: ['email', 'profile'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: Profile): Promise<any> {
    const data: IOAuth = {
      id: profile.id,
      name: { familyName: profile._json.family_name, givenName: profile._json.given_name },
      email: profile._json.email,
      provider: Provider.GOOGLE,
      icon: profile._json.picture,
      role: 'user',
      displayName: profile._json.name,
    };

    const user = await this.authService.findOrCreateOAuthUser(data);
    console.log('user', user);
    return user;
  }
}
