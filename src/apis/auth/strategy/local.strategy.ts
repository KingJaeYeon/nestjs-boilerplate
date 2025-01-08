import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy as Local } from 'passport-local';
import { AuthService } from '@/apis/auth/auth.service';
import { LoginDto } from '@/apis/auth/dto/login.dto';
import { validateOrReject } from 'class-validator';
import { CoreException } from '@/common/exception';

@Injectable()
export class LocalStrategy extends PassportStrategy(Local) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'email' });
  }

  async validate(email: string, password: string): Promise<any> {
    const dto = new LoginDto(email, password);
    try {
      await validateOrReject(dto);
    } catch (e) {
      throw new CoreException('INVALID_INPUT', '', 400);
    }
    return this.authService.validateLocalUser(dto);
  }
}
