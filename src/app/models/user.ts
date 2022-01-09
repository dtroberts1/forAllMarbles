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
    city ?: string;
    state ?: string;
    isAdmin ?: boolean;
}

export class AuthUser{
    key ?: string;
    emailAddress ?: string;
}