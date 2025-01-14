import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { AUTHORIZATION } from '@/common/config';
import { IUserPayload } from '@/apis/auth/interfaces';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, AUTHORIZATION) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req) => req?.cookies[AUTHORIZATION] || null, // 쿠키에서 추출
        ExtractJwt.fromAuthHeaderAsBearerToken(), // Authorization 헤더에서 추출
        ExtractJwt.fromUrlQueryParameter('token'), // URL 쿼리 파라미터에서 추출
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: IUserPayload & { iat: number; exp: number }) {
    return payload;
  }
}
