import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { EmailVerificationService } from '@/email-verification/email-verification.service';
import { ResponseDto } from '@/common/response.dto';
import { CoreException, ErrorCode } from '@/common/exception';

@Controller('email-verification')
export class EmailVerificationController {
  constructor(private emailVerificationService: EmailVerificationService) {}

  @Post('request')
  async requestVerification(@Body() body: { userId: string; email: string }) {
    const token = await this.emailVerificationService.createVerification(body.userId, body.email);

    // 이메일 발송 로직
    const link = `https://yourdomain.com/email-verification/verify?token=${encodeURIComponent(token)}`;
    console.log(`Send email to ${body.email} with token: ${token}`);

    return { message: 'Verification email sent.', token }; // 실제로는 token을 노출하지 않음
  }

  @Get('verify')
  async verify(@Query('token') token: string) {
    if (!token) {
      throw new CoreException(ErrorCode.NOT_FOUND);
    }
    await this.emailVerificationService.verifyToken(token);
    return ResponseDto.success(
      { redirectURL: 'https://yourdomain.com/내정보' },
      'Email verified successfully.',
    );
  }
}
