import { Bid } from "./bid";

export class User {
    key ?: string;
    bids ?: string[];
    displayName ?: string;
    emailAddress ?: string;
}

export class AuthUser{
    key ?: string;
    emailAddress ?: string;
}