import { Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ResponseDto } from '@/common/response.dto';
import { Request, Response } from 'express';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService, //
  ) {}

  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@Req() req: Request & { user: any }, @Res() res: Response) {
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
