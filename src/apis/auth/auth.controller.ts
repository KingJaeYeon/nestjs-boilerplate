import { Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ResponseDto } from '@/common/response.dto';
import { Request, Response } from 'express';
import { StrategyType } from '@/common/config';
import { DynamicStrategyGuard } from '@/apis/auth/strategy';
import { GetUser } from '@/common/decorators';

@Controller('/api/v1/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService, //
  ) {}

  @UseGuards(DynamicStrategyGuard(StrategyType.LOCAL))
  @Post('login')
  async login(@Res() res: Response, @GetUser('id') userId: string) {
    const token = await this.authService.generateToken({ userId });
    this.authService.setAuthCookies(res, token);
    return res.json(ResponseDto.success({ id: userId }, 'Login Successful', 201));
  }

  @Post('logout')
  async logout(@Res() res: Response) {
    this.authService.clearAuthCookies(res);
    return res.json(ResponseDto.success(null, 'Logout Successful', 201));
  }

  @Post('refresh')
  async refresh(@Req() req: Request, @Res() res: Response) {}
}
