import { Component, ElementRef, ViewChild } from '@angular/core';
import { Grammar } from './interfaces/grammar';
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
  teams!: Team[];
  players!: Player[];
  phrase1isEdit: boolean = false;
  phrase1Options: string[] = [
    'I will bet that',
    'I would like to place a bet that',
  ];
  playerNames: string[] = [
    'Tom Brady','Jim Obrien',
  ]
  

  constructor(
    private nflService: NflFeedService,
  ){

  }

  focusBet(event: any){

      let start = this.betElement.nativeElement.selectionStart;
      if (start > 0){
      }

  }

  betChanged(){

    setTimeout(() => {

      // Figure out which phrase was modified
      let currIndex = this.betElement.nativeElement.selectionStart;

      let phrases = this.grammar.phrases.filter(
        phrase => currIndex > phrase.startIndex && phrase.startIndex != -1
      );
      let currPhraseIndex = phrases.length - 1 >= 0 ? phrases.length - 1 : 0;

      if (currPhraseIndex > -1){
        if (currIndex > 0){
          let isMatch = this.bet.match(this.grammar.phrases[currPhraseIndex].acceptablePattern);
    
          if (isMatch){
            this.grammar.phrases[currPhraseIndex].phraseText = this.bet.slice(this.grammar.phrases[currPhraseIndex].startIndex, isMatch[0]?.length);
            this.grammar.phrases[currPhraseIndex].endIndex = isMatch[0]?.length + this.grammar.phrases[currPhraseIndex].startIndex;
            if (this.grammar.phrases.length > (currPhraseIndex + 1) && this.grammar.phrases[currPhraseIndex].endIndex){
              this.grammar.phrases[currPhraseIndex + 1].startIndex = <number>this.grammar.phrases[currPhraseIndex].endIndex + 1;
            }
            this.grammar.phrases[currPhraseIndex].phraseText = isMatch[0];
            
            this.grammar.phrases[currPhraseIndex].operation(isMatch[0]);

          }
          else{
            this.grammar.phrases[currPhraseIndex].phraseText = null;
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
          this.players = res.players;
          this.teams = res.teams;
          console.log({"players":this.players});
          console.log({"teams":this.teams});

        },
        err => {

        }
      )

    let pipedPlayerNames : string = this.playerNames.toString().replace(',','|');

    this.grammar = {
      phrases: [
        {
          phraseNbr: 0,
          phraseText: '',
          acceptablePattern: /(I will bet that|I would like to place a bet that)+(\d\w\s)*/i,
          startIndex: 0,
          endIndex: 0,
          operation: function(str: string){
          }
        },
        {
          phraseNbr: 1,
          phraseText: '',
          acceptablePattern: new RegExp(pipedPlayerNames),
          startIndex: -1,
          endIndex: null,
          operation: function(str: string){
            // If player, coach, or team was selected
              // Determine type (player, coach, or team)
              // If Player
                // Get Position
                // If Quarterback
                // Come back with QB related stat phrases
          },
        }
      ],
    }
    this.grammar.phrases[0].startIndex = 0;

    this.bet = 'I would like to place a bet that ';
    this.betChanged();
    ///\/(Tom Brady|Jim Obrien)+\/i/
    //new RegExp('/(' + pipedPlayerNames + ')+/i'),
  }

  addToBetText(str : string){ 
    this.bet = this.bet + str; 
  }
}
