import { IM } from "../models/im";

export interface UniqueDay {
    dateMillisec: Number, 
    imList : IM[],
    dateFormatted : string;
}