import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { LOCAL } from '@/common/config';

@Injectable()
export class LocalAuthGuard extends AuthGuard(LOCAL) {}
