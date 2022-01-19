import { SupportingDoc } from "./supporting-doc";

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
    isNew ?: boolean | null;
    isApproved ?: boolean | null;
    hasResult ?: boolean | null;
    resultVerified ?: boolean | null;
    isCancelled ?: boolean | null;
    declaredWinner ?: string | null;
    declaredLoser ?: string | null;
    winnerSupportingDocs ?: SupportingDoc[] | null; 
    loserSupportingDocs ?: SupportingDoc[] | null; 
    verifiedWinner?: string | null;
    verifiedLoser?: string | null;
    verifiedDate ?: Date;
}

