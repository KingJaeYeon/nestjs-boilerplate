// 참조할만한 자료

/* import { applyDecorators, UseGuards } from '@nestjs/common';
 import { ApiBearerAuth } from '@nestjs/swagger';
 import { JwtAuthGuard } from 'src/auth/guards';
 import { ACGuard, Role, UseRoles } from 'nest-access-control';

 export function Auth(...roles: Role[]) {
   return applyDecorators(
     UseGuards(JwtAuthGuard, ACGuard),
     UseRoles(...roles),
     ApiBearerAuth(),
   );
 }

이 코드는 NestJS에서 권한 관리 및 인증 데코레이터를 정의하는 함수입니다.
Auth 함수는 여러 데코레이터를 한 번에 결합하여 JWT 인증과 **권한 기반 접근 제어(Access Control)**를 적용합니다.

Auth(...roles: Role[]):
	•	이 함수는 roles를 인자로 받아서 해당 역할(role)에 대한 권한을 설정합니다.
	•	사용 시 @Auth('admin'), @Auth('users', 'moderator')처럼 특정 역할을 지정할 수 있습니다.

applyDecorators:
	•	여러 데코레이터를 조합하여 하나의 데코레이터로 반환합니다.
	•	NestJS에서 여러 데코레이터를 일관성 있게 적용하려고 사용할 수 있습니다.

예제

@Controller('users')
export class UserController {
  @Get()
  @Auth('admin') // admin 역할만 접근 가능
  findAll() {
    return 'Only admins can access this endpoint';
  }

  @Post()
  @Auth('users', 'admin') // user와 admin 모두 접근 가능
  createUser() {
    return 'Users or Admins can access this endpoint';
  }
}

동작 과정:
1.	JWT 인증 (JwtAuthGuard):
	•	사용자가 요청 시 헤더에 Authorization: Bearer <token>를 포함해야 합니다.
	•	토큰이 유효하지 않으면 요청이 차단됩니다.
2.	권한 확인 (ACGuard + UseRoles):
	•	토큰이 유효한 경우, 사용자의 역할(Role)을 검사합니다.
	•	요청에서 요구되는 역할이 없는 경우, 요청이 차단됩니다.
3.	Swagger 문서 설정 (ApiBearerAuth):
	•	Swagger에서 이 API가 Bearer 인증이 필요함을 표시하고, 테스트 시 토큰 입력란이 제공됩니다.

동작 과정:
1.	JWT 인증 (JwtAuthGuard):
	•	사용자가 요청 시 헤더에 Authorization: Bearer <token>를 포함해야 합니다.
	•	토큰이 유효하지 않으면 요청이 차단됩니다.
2.	권한 확인 (ACGuard + UseRoles):
	•	토큰이 유효한 경우, 사용자의 역할(Role)을 검사합니다.
	•	요청에서 요구되는 역할이 없는 경우, 요청이 차단됩니다.
3.	Swagger 문서 설정 (ApiBearerAuth):
	•	Swagger에서 이 API가 Bearer 인증이 필요함을 표시하고, 테스트 시 토큰 입력란이 제공됩니다.
 */
