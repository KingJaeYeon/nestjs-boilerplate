import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { VerificationService } from '@/apis/verification/verification.service';
import { CreateTokenDto, TokenDto } from '@/apis/verification/dto';
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
    try {
      await this.verificationService.verifyToken(query);
      const redirectUrl = 'https://yourdomain.com/my/setting';
      const urls = {
        EMAIL_VERIFICATION: '',
        PASSWORD_RESET: `https://yourdomain.com/signIn/update/password?token=${query.token}&redirect=${redirectUrl}`,
        EMAIL_CHANGE: `https://yourdomain.com/signIn/update/email?token=${query.token}&redirect=${redirectUrl}`
      };
      return ResponseDto.success({ redirectURL: urls[query.type] }, 'Email verified successfully.');
    } catch {
      return ResponseDto.success(
        { redirectURL: 'https://yourdomain.com/my/setting', success: false },
        'invalid url'
      );
    }
  }
}
