import { OAuth2Client } from "google-auth-library";
import { google } from "googleapis";
import { Constants } from "../constants";
import { Leiding, Opkomst, Verkenner } from "../Types";

export const getOpkomsten = async (auth: OAuth2Client, history: true) => {
    const sheets = google.sheets({ version: 'v4', auth });

    const response = await sheets.spreadsheets.values.get({
        spreadsheetId: Constants.VerkennersSpreadSheetId,
        range: Constants.OpkomstRange,
        valueRenderOption: 'UNFORMATTED_VALUE', // raw numbers/booleans
    });
    const rows = response.data.values ?? [];
    let normalized: Opkomst[] = normalizeOpkomsten(rows.slice(2));
    if (!history) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        normalized = normalized.filter(n => n.Op && n.Op > yesterday);
    }
    return normalized;
};

export const getNextOpkomst = async (auth: OAuth2Client) => {
    const sheets = google.sheets({ version: 'v4', auth });

    const response = await sheets.spreadsheets.values.get({
        spreadsheetId: Constants.VerkennersSpreadSheetId,
        range: Constants.OpkomstRange,
        valueRenderOption: 'UNFORMATTED_VALUE', // raw numbers/booleans
    });
    const rows = response.data.values ?? [];
    const normalized: Opkomst[] = normalizeOpkomsten(rows.slice(1));
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return normalized.find(n => n.Op && n.Op > yesterday);
};

export const getLeiding = async (auth: OAuth2Client) => {
    const sheets = google.sheets({ version: 'v4', auth });

    const response = await sheets.spreadsheets.values.get({
        spreadsheetId: Constants.VerkennersSpreadSheetId,
        range: Constants.LeidingRange,
        valueRenderOption: 'UNFORMATTED_VALUE', // raw numbers/booleans
    });
    const rows = response.data.values ?? [];
    return normalizeLeiding(rows.slice(1));
};
export const updateOpkomst = async (auth: OAuth2Client, opkomst: Opkomst) => {
    const sheets = google.sheets({ version: 'v4', auth });
    const { OpkomstId, Op, Tot, Omschrijving = "", Opmerkingen = "", StuurmanVanDeDag: { Naam: stuurmanNaam }, LeidingAanwezig = [], LeidingAfwezig = [], VerkennerAfwezig = [], EerderWeg = [] } = opkomst;
    const aanwezigeLeiding = LeidingAanwezig?.map(l => l.Naam).join(", ");
    const afwezigeLeiding = LeidingAfwezig?.map(l => l.Naam).join(", ");
    const afwezigeVerkenners = VerkennerAfwezig?.map(v => v.Naam).join(", ");
    const eerderWegVerkenners = EerderWeg?.map(v => v.Naam).join(", ");
    try {
        const rowNumber = OpkomstId;
        const updated = await sheets.spreadsheets.values.update({
            spreadsheetId: Constants.VerkennersSpreadSheetId,
            range: `Opkomsten!A${rowNumber}:Z${rowNumber}`,
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values: [[dateToSerial(Op), dateToSerial(Tot), Omschrijving, Opmerkingen, stuurmanNaam, aanwezigeLeiding, afwezigeLeiding, afwezigeVerkenners, eerderWegVerkenners]],
            },
        });
        return updated;
    } catch (error) {
        console.error('Fout bij updaten van opkomst:', error);
        throw error;
    }
};

export const getOpkomst = async (auth: OAuth2Client, opkomstId: number) => {
    const sheets = google.sheets({ version: 'v4', auth });
    try {
        const rowNumber = opkomstId;
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: Constants.VerkennersSpreadSheetId,
            range: `Opkomsten!A${rowNumber}:Z${rowNumber}`,
            valueRenderOption: 'UNFORMATTED_VALUE'
        });
        const rows = response.data.values ?? [];
        const normalized = normalizeOpkomsten(rows);
        return {
            ...normalized[0],
            OpkomstId: opkomstId
        };
    } catch (error) {
        console.error('Fout bij updaten van opkomst:', error);
        throw error;
    }
};

const serialToDateUTC = (serial: number): Date => {
    // Google Sheets & Excel use 1899-12-30 as day 0
    const ms = Math.round(serial * 24 * 60 * 60 * 1000);
    const epoch = Date.UTC(1899, 11, 30); // months are 0-based
    return new Date(epoch + ms);
};

const dateToSerial = (date: Date | undefined): number | string => {
    if (!date) {
        return "";
    }
    if (typeof date === "string") {
        date = new Date(date);
    }
    const epoch = new Date(Date.UTC(1899, 11, 30)).getTime();
    const diffMs = date.getTime() - epoch;
    return diffMs / (24 * 60 * 60 * 1000);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const normalizeOpkomsten = (rows: any[][]): Opkomst[] => {
    return rows.map<Opkomst>((row, index) => {
        return {
            OpkomstId: index + 2,
            Op: serialToDateUTC(row[0]),
            Tot: typeof row[1] === "number" && serialToDateUTC(row[1]),
            Omschrijving: row[2],
            Opmerkingen: row[3],
            StuurmanVanDeDag: { Naam: row[4] },
            LeidingAanwezig: (row[5] as string)?.split(',').map<Leiding>(l => ({ Naam: l.trim() })) || [],
            LeidingAfwezig: (row[6] as string)?.split(',').map(l => ({ Naam: l.trim() })) || [],
            VerkennerAfwezig: (row[7] as string)?.split(',').map(l => ({ Naam: l.trim() })) || [],
            EerderWeg: (row[8] as string)?.split(',').map(l => ({ Naam: l.trim() })) || [],
        } as Opkomst;
    });
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const normalizeLeiding = (rows: any[][]): Leiding[] => {
    return rows.map<Leiding>((row, index) => {
        return {
            LeidingId: index + 2,
            Naam: row[0].trim(),
            Functie: row[1].trim(),
            CWO: row[2].trim(),
            Ketelmeer: row[3],
            Sleper: row[4]
        };
    }).filter(f => f.Naam.trim().length > 0);
};
export const getVerkenners = async (auth: OAuth2Client): Promise<Verkenner[]> => {
    const sheets = google.sheets({ version: 'v4', auth });

    const response = await sheets.spreadsheets.values.get({
        spreadsheetId: Constants.VerkennersSpreadSheetId,
        range: Constants.VerkennerRange,
        valueRenderOption: 'UNFORMATTED_VALUE', // raw numbers/booleans
    });
    const rows = response.data.values ?? [];
    return normalizeVerkenner(rows.slice(1));
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const normalizeVerkenner = (rows: any[][]): Verkenner[] => {
    return rows.map<Verkenner>((row, index) => {
        return {
            VerkennerId: index + 2,
            Naam: row[0].trim(),
            Functie: row[1].trim(),
            CWO: row[2].trim(),
            Vlet: row[3].trim()
        };
    }).filter(f => f.Naam.trim().length > 0);
};

