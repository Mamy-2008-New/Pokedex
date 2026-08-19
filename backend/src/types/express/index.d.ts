// backend/types/express/index.d.ts

import { User } from "@prisma/client";

declare global {
  namespace Express {
    export interface Request {
      user?: User; // on attache l'utilisateur décodé à la requête
    }
  }
}

export {};
