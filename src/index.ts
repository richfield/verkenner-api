import express, { Express, NextFunction, Request, Response } from 'express';
import cors from 'cors';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import opkomstRoutes from './routes/OpkomstRoutes';
import metaDataRoutes from './routes/MetaDataRoutes';
import authRoutes from './routes/Auth';
import dotenv from 'dotenv';
dotenv.config();
const app: Express = express();
const PORT = process.env.PORT || 3010;
app.use(cors());
app.use(express.json());

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<void | express.Response<any, Record<string, any>>> => {
  if (req.path.startsWith('/api/auth')) {
    return next();
  }
  const token = req.headers.authorization?.split('Bearer ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const auth = new google.auth.OAuth2() as OAuth2Client & { spreadsheetId?: string };
    auth.setCredentials({ access_token: token });
    const spreadsheetId = req.header('X-Spreadsheet-Id');
    if (!spreadsheetId || !/^[a-zA-Z0-9_-]{20,}$/.test(spreadsheetId)) {
      return res.status(400).json({ error: 'Selecteer eerst een Google Sheet' });
    }
    auth.spreadsheetId = spreadsheetId;
    req.auth = auth;
    next();
  } catch {
    return res.status(401).json({ error: 'Unauthorized' });
  }
};

app.use((req: Request, res: Response, next: NextFunction) => {
  authenticate(req, res, next).catch(next);
});

app.get('/', (req: Request, res: Response) => {
  return res.json({
    "result": true
  });
});

app.use('/api/opkomsten', opkomstRoutes);
app.use('/api/meta', metaDataRoutes);
app.use('/api/auth', authRoutes);

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server running on http://localhost:${PORT}`);
});
