import { Body, Controller, Get, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { ResponseDto } from '@/common/response.dto';
import { SignupDto } from './dto';
import { Roles } from '@/apis/auth/decorators';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Post('signup')
  async signUp(@Body() data: SignupDto) {
    const result = await this.userService.createUser(data);
    return ResponseDto.success(result, 'Create  successfully');
  }

  @Get('/builder')
  async test() {
    const result = 'test';
    return ResponseDto.builder<typeof result>().setData(result).build();
  }

  @Roles(['admin'])
  @Get('/admin')
  async adminTest() {
    return ResponseDto.success('admin', 'admin test');
  }
}
