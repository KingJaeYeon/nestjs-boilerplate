export interface IUserPayload {
  id: string;
  displayName: string;
  name: { familyName: string; givenName: string };
  icon: string;
  email: string;
  role: string;
}
