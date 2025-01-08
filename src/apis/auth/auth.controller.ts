import { Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ResponseDto } from '@/common/response.dto';
import { Request, Response } from 'express';
import { StrategyType } from '@/common/constants';
import { DynamicStrategyGuard } from '@/apis/auth/strategy/dynamic-strategy.guard';

@Controller('/api/v1/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService, //
  ) {}

  @UseGuards(DynamicStrategyGuard(StrategyType.LOCAL))
  @Post('login')
  async login(@Req() req: Request, @Res() res: Response) {
    const token = await this.authService.generateToken(req.user.id);
    this.authService.setAuthCookies(res, token);
    return res.json(ResponseDto.success({ id: req.user.id }, 'Login Successful', 201));
  }

  @Post('logout')
  async logout(@Res() res: Response) {
    this.authService.clearAuthCookies(res);
    return res.json(ResponseDto.success(null, 'Logout Successful', 201));
  }

  @Post('refresh')
  async refresh(@Req() req: Request, @Res() res: Response) {}
}
