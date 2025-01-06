import { Body, Controller, Get, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { ResponseDto } from '../../common/response.dto';
import { SignupDto } from './dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('signup')
  async signUp(@Body() data: SignupDto) {
    const result = await this.userService.createUser(data);
    return ResponseDto.success(result, 'Create user successfully');
  }

  @Get('/builder')
  async test() {
    const result = 'test';
    return ResponseDto.builder<typeof result>().setData(result).build();
  }

  @Get('/responseDto')
  async responseDto() {
    return ResponseDto.success('test', 'SignUp Successfully', 201);
  }
}
