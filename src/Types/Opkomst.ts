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