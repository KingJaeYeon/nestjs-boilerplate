import { Profile, Strategy } from 'passport-google-oauth20';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { GOOGLE } from '@/common/config';
import { ConfigService } from '@nestjs/config';
import { IOAuth } from '@/apis/auth/interfaces';
import { Provider } from '@prisma/client';
import { UsersService } from '@/apis/users/users.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, GOOGLE) {
  constructor(
    configService: ConfigService,
    private readonly userService: UsersService
  ) {
    super({
      clientID: configService.get('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.get('GOOGLE_CALLBACK'),
      scope: ['email', 'profile'],
      prompt: 'consent'
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
      displayName: profile._json.name
    };

    const payload = await this.userService.findOrCreateOAuthUser(data);
    console.log('payload', payload);
    return payload;
  }

  authorizationParams(options: any): object {
    options['prompt'] = 'select_account';
    return options;
  }
}
