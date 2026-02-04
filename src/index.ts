import express, { Express, NextFunction, Request, Response } from 'express';
import cors from 'cors';
import { google } from 'googleapis';
import opkomstRoutes from './routes/OpkomstRoutes'
import metaDataRoutes from './routes/MetaDataRoutes'

const app: Express = express();
const PORT = process.env.PORT || 3010;
const SPREADSHEET_ID = '1_OIZYeh0pL7leC0GmmRkj-W6O_q6tRjlMthBl8oxf2U';

app.use(cors());
app.use(express.json());

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<void | express.Response<any, Record<string, any>>> => {
  const token = req.headers.authorization?.split('Bearer ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: token });
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
    })
});

app.use('/api/opkomsten', opkomstRoutes);
app.use('/api/meta', metaDataRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
