export const AUTHORIZATION = 'access';
export const GOOGLE = 'google';
export const REFRESH = 'refresh';
export const REFRESH_LOGOUT = 'logout';
export const LOCAL = 'local';

export enum RoleType {
  USER = 'USER',
  ADMIN = 'ADMIN'
}

export const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;