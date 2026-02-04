// types/express.d.ts
import { OAuth2Client } from 'google-auth-library';

declare global {
  namespace Express {
    interface Request {
      auth?: OAuth2Client; // Voeg de `auth`-client toe aan het `Request`-object
    }
  }
}
