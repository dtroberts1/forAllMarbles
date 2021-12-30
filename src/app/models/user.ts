import { Bid } from "./bid";

export class User {
    key ?: string;
    bids ?: string[];
    displayName ?: string;
    emailAddress ?: string;
    fullName ?: string;
    firstName ?: string;
    lastName ?: string;
    cityState ?: string;
    profilePicSrc ?: string;
}

export class AuthUser{
    key ?: string;
    emailAddress ?: string;
}