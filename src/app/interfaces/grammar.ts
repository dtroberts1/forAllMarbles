export interface Grammar {
    phrases: Phrase[],

}

export interface Phrase{
    component: any,
    phraseIdentifier: string,
    phraseNbr: number,
    phraseText: string | null,
    acceptablePattern: string | RegExp | null,
    startIndex: number,
    endIndex: number | null,
    complete(str: string):void,
    reset():void,
    filterSearch():void | null,
}
