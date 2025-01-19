import { Module } from '@nestjs/common';
import { VerificationController } from './verification.controller';
import { VerificationService } from './verification.service';
import { VerificationCleanerService } from '@/apis/verification/verification-cleaner.service';

@Module({
  controllers: [VerificationController],
  providers: [VerificationService, VerificationCleanerService],
})
export class VerificationModule {}
