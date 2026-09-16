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
    } catch (error) {
        console.error('Fout bij laden van verkenners:', error);
        res.status(500).json({ error: 'Fout bij laden van verkenners' });
    }
});

router.get('/verkenner-options', async (req, res) => {
    if (!req.auth) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    try {
        const [cwoOptions, vletOptions] = await Promise.all([
            spreadSheetService.getCwoOptions(req.auth),
            spreadSheetService.getVletOptions(req.auth),
        ]);
        res.status(200).json({ cwoOptions, vletOptions });
    } catch (error) {
        console.error('Fout bij laden van verkenneropties:', error);
        res.status(500).json({ error: 'Fout bij laden van verkenneropties' });
    }
});

router.put('/verkenners/:id', async (req, res) => {
    if (!req.auth) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    const verkennerId = Number(req.params.id);
    const { CWO, Vlet } = req.body;
    if (!Number.isInteger(verkennerId) || verkennerId < 2 || typeof CWO !== 'string' || typeof Vlet !== 'string') {
        return res.status(400).json({ error: 'Ongeldige verkennergegevens' });
    }
    try {
        await spreadSheetService.updateVerkenner(req.auth, {
            VerkennerId: verkennerId,
            Naam: '',
            CWO: CWO.trim(),
            Vlet: Vlet.trim(),
        });
        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Fout bij opslaan van verkenner:', error);
        res.status(500).json({ error: 'Fout bij opslaan van verkenner' });
    }
});

export default router;