import { Body, Controller, Post, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ResponseDto } from '../../common/response.dto';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService, //
  ) {}

  @Post('login')
  async login(@Res() res: Response, @Body() data: LoginDto) {
    const { token, user } = await this.authService.login(data);
    this.authService.setAuthCookies(res, token);
    return ResponseDto.success(user.id, 'Login Successfully', 200);
  }
}
