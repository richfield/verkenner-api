import { test, mock } from 'node:test';
import assert from 'node:assert/strict';
import googleapis from 'googleapis';
import spreadSheetService from '../dist/services/spreadSheetService.js';

const { google } = googleapis;
const { getVerkenners, updateVerkenner } = spreadSheetService;

const auth = { spreadsheetId: 'selected-spreadsheet' };

for (const title of ['Verkenners', 'Dolfijnen', "Groep O'Brien"]) {
    test(`reads and writes the tab named after ${title}`, async (t) => {
        const getMetadata = mock.fn(async () => ({
            data: { properties: { title }, sheets: [{ properties: { title } }] },
        }));
        const getValues = mock.fn(async () => ({
            data: { values: [['Naam'], ['Sam', 'Bootsman', 'CWO III', 'Brekken', 'https://example.com']] },
        }));
        const updateValues = mock.fn(async () => ({ data: {} }));
        t.mock.method(google, 'sheets', () => ({
            spreadsheets: { get: getMetadata, values: { get: getValues, update: updateValues } },
        }));

        const scouts = await getVerkenners(auth);
        assert.equal(scouts[0].Naam, 'Sam');
        await updateVerkenner(auth, scouts[0]);
        const quotedTitle = `'${title.replace(/'/g, "''")}'`;
        assert.equal(getValues.mock.calls[0].arguments[0].range, `${quotedTitle}!A1:E100`);
        assert.equal(updateValues.mock.calls[0].arguments[0].range, `${quotedTitle}!B2:E2`);
        assert.deepEqual(updateValues.mock.calls[0].arguments[0].requestBody.values,
            [['Bootsman', 'CWO III', 'Brekken', 'https://example.com']]);
        assert.equal(getMetadata.mock.calls.length, 2);
    });
}

test('does not read or write a different tab when the matching tab is missing', async (t) => {
    const getValues = mock.fn();
    const updateValues = mock.fn();
    t.mock.method(google, 'sheets', () => ({
        spreadsheets: {
            get: async () => ({ data: { properties: { title: 'Dolfijnen' }, sheets: [{ properties: { title: 'Verkenners' } }] } }),
            values: { get: getValues, update: updateValues },
        },
    }));

    await assert.rejects(getVerkenners(auth), /Geen tabblad gevonden/);
    await assert.rejects(updateVerkenner(auth, { VerkennerId: 2, Naam: 'Sam', Vlet: '' }), /Geen tabblad gevonden/);
    assert.equal(getValues.mock.calls.length, 0);
    assert.equal(updateValues.mock.calls.length, 0);
});
