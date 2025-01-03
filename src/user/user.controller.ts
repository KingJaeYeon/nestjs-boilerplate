import { Controller, Get, HttpStatus, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { ResponseDto } from '../common/response.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('/sign-up')
  async signUp() {
    const result = await this.userService.createUser();
    return ResponseDto.success(result, '회원가입 성공', 200);
  }

  @Get('/builder')
  async test() {
    return ResponseDto.builder().setData('test').setStatus(201).setMessage('responseDto 테스트').build();
  }

  @Get('/responseDto')
  async responseDto() {
    return ResponseDto.success('test', 'responseDto 테스트', 201);
  }
}
