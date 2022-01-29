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
    backgroundUrlPreference ?: string;
    backgroundSizePreference ?: string;
    backgroundPositionPreference ?: string;
    opacity ?: number;
    nightMode ?: boolean;
    primaryColor ?: string;
    accentColor ?: string;
}

export class AuthUser{
    key ?: string;
    emailAddress ?: string;
}