// src/routes/auth.ts
import express, { Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import { TokenData } from '../Types/tokenData';

const router = express.Router();

router.post('/refresh-token', async (req: Request, res: Response) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(400).json({ error: 'Refresh token is vereist' });
    }

    try {
        const oauth2Client = new OAuth2Client(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
        );

        oauth2Client.setCredentials({
            refresh_token: refreshToken,
        });

        const { credentials } = await oauth2Client.refreshAccessToken();
        res.json({ accessToken: credentials.access_token });
    } catch (error) {
        console.error('Fout bij vernieuwen van token:', error);
        res.status(500).json({ error: 'Fout bij vernieuwen van token' });
    }
});

router.post('/login', async (req: Request, res: Response) => {
    const { code } = req.body;
    console.log({code});
    if (!code) {
        res.status(500).json({ error: 'Fout bij vernieuwen van token' });
    }

    try {
        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                code: code,
                client_id: process.env.GOOGLE_CLIENT_ID || "",
                client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
                redirect_uri: 'postmessage', // Gebruik 'postmessage' voor @react-oauth/google
                grant_type: 'authorization_code',
            }),
        });
        const tokenData = await tokenResponse.json() as TokenData;
        console.log({tokenResponse, tokenData});
        res.json({ ...tokenData });
    } catch (error) {
        console.error('Fout bij vernieuwen van token:', error);
        res.status(500).json({ error: 'Fout bij vernieuwen van token' });
    }
});

export default router;
