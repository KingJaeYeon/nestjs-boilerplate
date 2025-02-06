import { Controller, Get, Headers, Ip, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ResponseDto } from '@/common/response.dto';
import { Request, Response } from 'express';
import { GetUser, Public } from '@/apis/auth/decorators';
import { LocalAuthGuard } from '@/apis/auth/guards';
import { IUserPayload } from '@/apis/auth/interfaces';
import { REFRESH } from '@/common/config';
import { CoreException, ErrorCode } from '@/common/exception';
import { GoogleAuthGuard } from '@/apis/auth/guards/google-auth.guard';

@Public()
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService, //
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(
    @GetUser() payload: IUserPayload,
    @Res({ passthrough: true }) res: Response,
    @Headers('userAgent') userAgent: string,
    @Ip() ipAddress: string,
  ) {
    const token = await this.authService.generateTokens(payload, userAgent, ipAddress);
    this.authService.setAuthCookies(res, token);
    return ResponseDto.success({ id: payload.id }, 'Login Successful', 201);
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  async googleLogin() {}

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleLoginCallback(
    @GetUser() payload: IUserPayload,
    @Res({ passthrough: true }) res: Response,
    @Headers('userAgent') userAgent: string,
    @Ip() ipAddress: string,
  ) {
    console.log('googleLoginCallback');
    // const token = await this.authService.generateTokens(payload, userAgent, ipAddress);
    // this.authService.setAuthCookies(res, token);
    // return ResponseDto.success({ id: payload.id }, 'Login Successful', 201);
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    this.authService.clearAuthCookies(res);
    return ResponseDto.success(null, 'Logout Successful', 201);
  }

  @Post('refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Headers('userAgent') userAgent: string,
    @Ip() ipAddress: string,
  ) {
    const refreshToken = req.cookies[REFRESH];

    if (!refreshToken) {
      throw new CoreException(ErrorCode.INVALID_REFRESH);
    }

    const token = await this.authService.rotateRefreshToken(refreshToken, ipAddress, userAgent);
    this.authService.setAuthCookies(res, token);
    return ResponseDto.success(null, 'RefreshToken rotated', 201);
  }
}
