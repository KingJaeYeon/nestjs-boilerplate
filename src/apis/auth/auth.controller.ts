import { Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ResponseDto } from '@/common/response.dto';
import { Request, Response } from 'express';
import { GetUser, Public } from '@/apis/auth/decorators';
import { LocalAuthGuard } from '@/apis/auth/guards';
import { IUserPayload } from '@/apis/auth/interfaces';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService, //
  ) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@GetUser() payload: IUserPayload, @Res({ passthrough: true }) res: Response) {
    const token = await this.authService.generateToken(payload);
    this.authService.setAuthCookies(res, token);
    return ResponseDto.success({ id: payload.id }, 'Login Successful', 201);
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    this.authService.clearAuthCookies(res);
    return ResponseDto.success(null, 'Logout Successful', 201);
  }

  @Post('refresh')
  async refresh(@Req() req: Request, @Res() res: Response) {}
}
