export interface Grammar {
    phrases: Phrase[],

}

export interface Phrase{
    phraseNbr: number,
    phraseText: string | null,
    acceptablePattern: string | RegExp,
    startIndex: number,
    endIndex: number | null,
    operation(str: string):void,
}
