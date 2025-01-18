import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { EmailVerificationService } from './email-verification.service';

@Injectable()
export class EmailVerificationCleanerService {
  constructor(private emailVerificationService: EmailVerificationService) {}

  // 매일 자정 만료된 토큰 삭제
  @Cron('0 0 * * *') // Cron 표현식: 매일 자정
  async handleCleanup() {
    console.log('Cleaning up expired email verifications...');
    await this.emailVerificationService.cleanExpiredTokens();
  }
}
