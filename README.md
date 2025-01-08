## Default 
- Barrel Exports 
  - 폴더별로 import 해서 가독성이 좋아진다.
- roro(Receive an object, return an object) 
  - 인자 순서 상관없이 객체로 받을 수 있고 없으면 Undifined로 반환되서 휴먼 에러를 줄일 수 있다.
## Prisma
- DAO

## CustomException

## ResponseDto



src @로 만들기


## passport-local
- 인증은 passport-local로 수행시키고 컨트롤러에서는 토큰 발급만 집중
- 인증로직이 변경되도 컨트롤러는 변경되지 않는다.
- 구글 로그인 등 다른 인증 방식을 추가할 때도 컨트롤러는 변경되지 않는다.
- node.js에서는 수많은 서비스에서 passport.js를 사용하여 인증 쪽을 개발하고 있다. 그거에 의미를 두자.
