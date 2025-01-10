import { Body, Controller, Get, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { ResponseDto } from '@/common/response.dto';
import { SignupDto } from './dto';
import { GetUser, Public, Roles } from '@/apis/auth/decorators';
import { IUserPayload } from '@/apis/auth/interfaces';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Public()
  @Post('signup')
  async signUp(@Body() data: SignupDto) {
    const result = await this.userService.createUser(data);
    return ResponseDto.success(result, 'Create  successfully');
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
