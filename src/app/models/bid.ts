export class Bid {
    key ?: string;
    title ?: string;
    bidAmount ?: number;
    bidChallengerKey ?: string;
    bidCreatorKey ?: string;
    bidMessage ?: string;
    bidCreatorChallengerKey ?: string;
    bids ?: Bid[];
    rootBidKey ?:string | null;
    parentPath ?: string | null;
}
