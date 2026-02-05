import express, { Request, Response } from 'express';
import * as spreadSheetService from '../services/spreadSheetService';
const router = express.Router();


router.get('/', (req: Request, res: Response) => {
    return res.json({
        "result": true
    });
});

router.get('/leiding', async (req, res) => {
    if (!req.auth) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    try {
        res.status(200).json(await spreadSheetService.getLeiding(req.auth));
    } catch {
        res.status(500).json({ error: 'Fout bij laden van opkomst' });
    }
});

router.get('/verkenners', async (req, res) => {
    if (!req.auth) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    try {
        res.status(200).json(await spreadSheetService.getVerkenners(req.auth));
    } catch {
        res.status(500).json({ error: 'Fout bij laden van opkomst' });
    }
});

export default router;