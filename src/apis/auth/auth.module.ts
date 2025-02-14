import { forwardRef, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy, LocalStrategy } from '@/apis/auth/strategies';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GoogleStrategy } from '@/apis/auth/strategies/google.strategy';
import { UsersModule } from '@/apis/users/users.module';
import { VerificationModule } from '@/apis/verification/verification.module';

@Module({
  imports: [
    forwardRef(() => UsersModule),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET')
      })
    }), //
    PassportModule,
    VerificationModule
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy, GoogleStrategy],
  exports: [AuthService]
})
export class AuthModule {}
