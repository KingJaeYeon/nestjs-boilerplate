import { Body, Controller, Get, Headers, Ip, Post, Res } from '@nestjs/common';
import { UsersService } from './users.service';
import { ResponseDto } from '@/common/response.dto';
import { SignupDto } from './dto';
import { GetUser, Public, Roles } from '@/apis/auth/decorators';
import { IUserPayload } from '@/apis/auth/interfaces';
import { AuthService } from '@/apis/auth/auth.service';
import { Response } from 'express';

@Controller('users')
export class UsersController {
  constructor(
    private readonly userService: UsersService,
    private readonly authService: AuthService
  ) {}

  @Public()
  @Post('signup')
  async signUp(
    @Res({ passthrough: true }) res: Response,
    @Headers('userAgent') userAgent: string,
    @Ip() ipAddress: string,
    @Body() data: SignupDto
  ) {
    const user = await this.userService.createUser(data);
    const payload = this.authService.buildUserPayload(user);
    const token = await this.authService.generateJwtTokens(payload, userAgent, ipAddress);
    this.authService.setAuthCookies(res, token);
    return ResponseDto.success({ id: payload.id }, 'Login Successful', 201);
  }

  @Get('/jwt-test')
  async test(@GetUser() user: IUserPayload) {
    return ResponseDto.builder<IUserPayload>().setData(user).build();
  }

  @Roles(['admin'])
  @Get('/admin')
  async adminTest() {
    return ResponseDto.success('admin', 'admin test');
  }
}
