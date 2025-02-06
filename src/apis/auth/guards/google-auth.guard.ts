import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GOOGLE } from '@/common/config';

@Injectable()
export class GoogleAuthGuard extends AuthGuard(GOOGLE) {}
