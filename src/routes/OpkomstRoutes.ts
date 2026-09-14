import express, { Request, Response } from 'express';
import * as spreadSheetService from '../services/spreadSheetService';
import { getOpkomst, updateOpkomst } from '../services/spreadSheetService';
const router = express.Router();


router.get('/', (req: Request, res: Response) => {
    return res.json({
        "result": true
    });
});
// Link a recipe to a date
router.post('/list', async (req: Request, res: Response) => {
    const { history } = req.body;
    if (!req.auth) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    try {
        const opkomsten = await spreadSheetService.getOpkomsten(req.auth, history);
        res.json(opkomsten);
    } catch (error) {

        console.error({ error, req, res });
        if (error instanceof Error) {
            res.status(500).json({ message: error.message });
        }
    }
});

router.post('/incidents', async (req, res) => {
    if (!req.auth) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    const { date, verkennerNaam, type } = req.body;
    if (!date || !verkennerNaam || !['late', 'uniform'].includes(type)) {
        return res.status(400).json({ error: 'Ongeldige incidentgegevens' });
    }
    try {
        await spreadSheetService.addUniformIncident(req.auth, {
            Datum: new Date(date),
            VerkennerNaam: verkennerNaam,
            Type: type,
        });
        res.status(201).json({ success: true });
    } catch {
        res.status(500).json({ error: 'Fout bij opslaan van incident' });
    }
});

router.get('/traktaties', async (req, res) => {
    if (!req.auth) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    try {
        res.status(200).json(await spreadSheetService.getTraktaties(req.auth));
    } catch {
        res.status(500).json({ error: 'Fout bij laden van traktaties' });
    }
});

router.put('/traktaties/:rowNumber', async (req, res) => {
    if (!req.auth) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    const rowNumber = Number(req.params.rowNumber);
    if (!Number.isInteger(rowNumber) || rowNumber < 2 || typeof req.body.done !== 'boolean') {
        return res.status(400).json({ error: 'Ongeldige traktatiegegevens' });
    }
    try {
        await spreadSheetService.markTraktatieDone(req.auth, rowNumber, req.body.done);
        res.status(200).json({ success: true });
    } catch {
        res.status(500).json({ error: 'Fout bij opslaan van traktatie' });
    }
});

router.get('/:rowIndex', async (req, res) => {
    if (!req.auth) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    const { rowIndex } = req.params;
    try {
        const opkomstId = parseInt(rowIndex);
        if (0 > opkomstId) {
            res.status(200).json(await spreadSheetService.getNextOpkomst(req.auth));
        } else {
            res.status(200).json(await getOpkomst(req.auth, opkomstId));
        }
    } catch {
        res.status(500).json({ error: 'Fout bij laden van opkomst' });
    }
});

// Voorbeeld: API-route om een opkomst te updaten
router.put('/:rowIndex', async (req, res) => {
    if (!req.auth) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    const { rowIndex } = req.params;
    const updatedData = req.body;

    try {
        await updateOpkomst(req.auth, { ...updatedData, OpkomstId: rowIndex });
        res.status(200).json({ success: true });
    } catch {
        res.status(500).json({ error: 'Fout bij updaten van opkomst' });
    }
});




export default router;
