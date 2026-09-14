import type { Leiding } from "./Leiding";
import type { Verkenner } from "./Verkenner";

export type Opkomst = {
    OpkomstId: number,
    Op?: Date,
    Tot?: Date,
    Omschrijving: string,
    Opmerkingen: string,
    StuurmanVanDeDag: Leiding,
    LeidingAanwezig: Leiding[],
    LeidingAfwezig: Leiding[],
    VerkennerAfwezig: Verkenner[]
    EerderWeg: Verkenner[]
}

export type IncidentType = 'late' | 'uniform' | 'unknown';

export type UniformIncident = {
    RowNumber?: number;
    Datum: Date;
    VerkennerNaam: string;
    Type: IncidentType;
};

export type Traktatie = {
    RowNumber: number;
    VerkennerNaam: string;
    AantalKeerVergeten: number;
    KerenOver: number;
    Getrakteerd: boolean;
    Aantal: number;
};