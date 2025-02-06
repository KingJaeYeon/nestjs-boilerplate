import { Provider } from '@prisma/client';

export interface IOAuth {
  id: string;
  displayName: string;
  name: { familyName: string; givenName: string };
  icon: string;
  email: string;
  role: string;
  provider: Provider;
}