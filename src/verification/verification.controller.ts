import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { VerificationService } from '@/verification/verification.service';
import { CreateTokenDto, TokenDto } from '@/verification/dto';
import { ResponseDto } from '@/common/response.dto';

@Controller('verification')
export class VerificationController {
  constructor(private verificationService: VerificationService) {}

  // 인증 요청 생성
  @Post('send-email')
  async sendVerificationEmail(@Body() data: CreateTokenDto) {
    await this.verificationService.sendVerificationEmail(data);
    return ResponseDto.success(null, 'Verification email sent');
  }

  @Get('verify')
  async verify(@Query() query: TokenDto) {
    await this.verificationService.verifyToken(query);
    return ResponseDto.success(
      { redirectURL: 'https://yourdomain.com/내정보' },
      'Email verified successfully.',
    );
  }
}
