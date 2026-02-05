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

router.get('/:rowIndex', async (req, res) => {
    if (!req.auth) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    const { rowIndex } = req.params;
    try {
        res.status(200).json(await getOpkomst(req.auth, parseInt(rowIndex)));
    } catch {
        res.status(500).json({ error: 'Fout bij laden van opkomst' });
    }
});


export default router;
