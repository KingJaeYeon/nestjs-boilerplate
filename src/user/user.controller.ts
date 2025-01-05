import { Controller, Get, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { ResponseDto } from '../common/response.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('/sign-up')
  async signUp() {
    const result = await this.userService.createUser();
    return ResponseDto.success(result);
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
