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
    return res.json(ResponseDto.success({ id: user.id }, 'Login Successful'));
  }

  @Post('logout')
  async logout(@Res() res: Response) {
    this.authService.clearAuthCookies(res);
    return res.json(ResponseDto.success(null, 'Logout Successful'));
  }
}
