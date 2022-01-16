export interface CompetitorHistory {
    deficit: number, 
    nbrWonAgainst: number, 
    nbrLostAgainst: number, 
    competitorName: string,
    competitorImgSrc: string,
    percentWon?: number,
    displayedPercentWon?: number
}
