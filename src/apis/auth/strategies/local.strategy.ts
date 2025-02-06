import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy as Local } from 'passport-local';
import { AuthService } from '@/apis/auth/auth.service';
import { LoginDto } from '@/apis/auth/dto';
import { validateOrReject } from 'class-validator';
import { CoreException } from '@/common/exception';
import { IUserPayload } from '@/apis/auth/interfaces';

@Injectable()
export class LocalStrategy extends PassportStrategy(Local) {
  constructor(private authService: AuthService) {
    super();
  }

  async validate(username: string, password: string): Promise<IUserPayload> {
    const dto = new LoginDto(username, password);
    try {
      await validateOrReject(dto);
    } catch (e) {
      const messages = e.map((el: any) => el.constraints);

      const msg = messages.reduce((acc: any, cur: any) => {
        const key = Object.keys(cur)[0];
        acc.push(cur[key]);
        return acc;
      }, []);

      throw new CoreException(msg.join(', '), 'INVALID INPUT', 400);
    }
    return this.authService.validateLocalUser(dto);
  }
}
