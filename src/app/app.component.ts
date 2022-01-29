import { Component, ElementRef, ViewChild } from '@angular/core';
import { Grammar, Phrase } from './interfaces/grammar';
import { Player } from './interfaces/player';
import { Team } from './interfaces/team';
import { NflFeedService } from './services/nfl-feed.service';


type PlayerParent =  {players: Player[] };

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent {
  @ViewChild('betEl')
  betElement!: ElementRef;
  grammar!: Grammar;
  bet!: string;
  title = 'forallmarbles';
  pipedPlayerNames!: string;
  teams!: Team[];
  players!: Player[];
  phrase1isEdit: boolean = false;
  phrase1Options: string[] = [
    'I will bet that',
    'I would like to place a bet that',
  ];

  phrase2Options: string[] = [

  ];


  filteredOptions: string[] = [

  ];  

  constructor(
    private nflService: NflFeedService,
  ){
  }

  focusBet(event: any){

    let currIndex = this.betElement.nativeElement.selectionStart;

    let phrases = this.grammar.phrases.filter(
      phrase => currIndex > phrase.startIndex && phrase.startIndex != -1
    );
    if (phrases){
      let currPhraseIndex = phrases.length - 1 >= 0 ? phrases.length - 1 : 0;
    }
  }


  betChanged(){
    // Bet String text changed

    setTimeout(() => {

      // Figure out which phrase was modified
      let currIndex = this.betElement.nativeElement.selectionStart;

      let phrases = this.grammar.phrases.filter(
        phrase => currIndex > phrase.startIndex && phrase.startIndex != -1
      );
      let currPhraseIndex = phrases.length - 1 >= 0 ? phrases.length - 1 : 0;

      if (currPhraseIndex > -1){
        if (currIndex > 0){
          let isMatch = null;
          /*
          if (this.grammar.phrases[currPhraseIndex].acceptablePattern instanceof RegExp){
            isMatch = this.bet.match(this.grammar.phrases[currPhraseIndex].acceptablePattern);
          }
          else{

          }
          */
          if (this.grammar.phrases[currPhraseIndex].acceptablePattern){
            isMatch = this.bet.match(<RegExp>this.grammar.phrases[currPhraseIndex].acceptablePattern);
          }

          if (isMatch){
            this.grammar.phrases[currPhraseIndex].phraseText = this.bet.slice(this.grammar.phrases[currPhraseIndex].startIndex, isMatch[0]?.length);
            this.grammar.phrases[currPhraseIndex].endIndex = isMatch[0]?.length + this.grammar.phrases[currPhraseIndex].startIndex;
            if (this.grammar.phrases.length > (currPhraseIndex + 1) && this.grammar.phrases[currPhraseIndex].endIndex){
              this.grammar.phrases[currPhraseIndex + 1].startIndex = <number>this.grammar.phrases[currPhraseIndex].endIndex + 1;
            }
            this.grammar.phrases[currPhraseIndex].phraseText = isMatch[0];
            
            this.grammar.phrases[currPhraseIndex].complete(isMatch[0]);
          }
          else{
            //this.grammar.phrases[currPhraseIndex].phraseText = null;
            this.grammar.phrases[currPhraseIndex].filterSearch();

          }
  
        }
      }
      else{
        // If currIndex is null (new phrase is being completed)
        //phrase.phraseText = null;

      }
    }, 100);
  }

  ngOnInit(): void {

    this.nflService.getPlayers()
      .subscribe(
        (res: {players: Player[], teams: Team[]}) => {
          this.players = [...new Set(res.players)];
          this.teams = res.teams;

          let pipedIntroTexts : string = this.phrase1Options.toString().replace(',','|');

          this.grammar = {
            phrases: [
              {
                component: this,
                phraseIdentifier: 'intro',
                phraseNbr: 0,
                phraseText: '',
                acceptablePattern: new RegExp('(' + pipedIntroTexts + ')+(\\d\\w\\s)*'),
                startIndex: 0,
                endIndex: 0,
                filterSearch: function() {
                  let comp = (<AppComponent>this.component);
      
                  let currText = comp.bet.slice(this.startIndex, 
                    (!this.endIndex ? comp.bet.length: this.endIndex));
                  if (Array.isArray(comp.phrase1Options)){
                    comp.filteredOptions = comp.phrase1Options
                    .filter(option => option.startsWith(currText))
                  }
      
                },
                reset: function() {
                  this.component.phrase2Options = [];
                },
                complete: function(str: string){
                  // Update options for the next phrase
                  let comp = (<AppComponent>this.component);
                  let currIndex = comp.betElement.nativeElement.selectionStart;
                  if (Array.isArray(comp.grammar.phrases)){
                    let nextPhrase = (<Phrase[]>comp.grammar.phrases).find((phrase: Phrase) => phrase.phraseNbr == this.phraseNbr + 1);
      
                    if (nextPhrase){
                      if (nextPhrase.startIndex == currIndex){
                        let teamNames = comp.teams.filter((item: Team) => item.name).map((team: any) => team.name);
                        let playerNames = comp.players.map((player: Player) => `${player.firstName} ${player.lastName}`);
            
                        comp.phrase2Options = [...teamNames, ...playerNames].sort(function(a, b){
                          if(a < b) { return -1; }
                          if(a > b) { return 1; }
                          return 0;
                        });
      
                        if (Array.isArray(comp.phrase2Options)){
                          comp.filteredOptions = comp.phrase2Options;
                          comp.pipedPlayerNames = comp.phrase2Options.join('|').toString().replace(',','|');
                          nextPhrase.acceptablePattern = new RegExp(comp.pipedPlayerNames);
      
                        }
                      }
                    }
                  }
                },
              },
              {
                component: this,
                phraseNbr: 1,
                phraseIdentifier: 'subject',
                phraseText: '',
                acceptablePattern: null,
                startIndex: -1,
                endIndex: null,
                filterSearch: function(){
                  let comp = (<AppComponent>this.component);
      
                  let currText = comp.bet.slice(this.startIndex, 
                    (!this.endIndex ? comp.bet.length: this.endIndex));
                  if (Array.isArray(comp.phrase2Options)){
                    comp.filteredOptions = comp.phrase2Options
                    .filter(option => option.startsWith(currText))
                  }
      
                },
                complete: function(str: string){
                  let comp = (<AppComponent>this.component);
      
                  // If player, coach, or team was selected
                  let subjectPhrase = comp.grammar.phrases.find(phrase => phrase.phraseIdentifier == "subject");
                  if (subjectPhrase?.phraseText){
                    let team = comp.teams.find(team => team.name == subjectPhrase?.phraseText);
                    if (!team){
                      let player = comp.players.find(player => (`${player.firstName} ${player.lastName}`) == subjectPhrase?.phraseText);
                    }
                    else{
                    }
              
                  }              // Determine type (player, coach, or team)
                    // If Player
                      // Get Position
                      // If Quarterback
                      // Come back with QB related stat phrases
                },
                reset: () => {
      
                },
              }
            ],
          }
          this.grammar.phrases[0].startIndex = 0;

        },
        err => {

        }
      )
  }

  addToBetText(str : string){ 
    // Figure out which phrase was modified
    let currIndex = this.betElement.nativeElement.selectionStart;

    let phrases = this.grammar.phrases.filter(
      phrase => currIndex > phrase.startIndex && phrase.startIndex != -1
    );
    let currPhraseIndex = phrases.length - 1 >= 0 ? phrases.length - 1 : 0;
    let phrase = this.grammar.phrases[currPhraseIndex];
    if (phrase){
      let currText = this.bet.slice(phrase.startIndex, 
        (!phrase.endIndex ? this.bet.length: phrase.endIndex));

      this.bet = this.bet.replace(currText, str);
      phrase.endIndex = phrase.startIndex + currIndex.length;
    }
  }
}
