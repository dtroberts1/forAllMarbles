export interface BidStats {
    wLRatio: number,
    totalEarnings: number,
    greatestWinYet: number,
    greatestWinBidName?: string,
    worstLossYet: number,
    worstLossBidName?: string,
    averageEarnings: number,
    totalBidCount: number,
}
