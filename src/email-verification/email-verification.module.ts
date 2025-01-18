import { Module } from '@nestjs/common';
import { EmailVerificationController } from './email-verification.controller';
import { EmailVerificationService } from './email-verification.service';
import { EmailVerificationCleanerService } from '@/email-verification/email-verification-cleaner.service';

@Module({
  controllers: [EmailVerificationController],
  providers: [EmailVerificationService, EmailVerificationCleanerService],
})
export class EmailVerificationModule {}
