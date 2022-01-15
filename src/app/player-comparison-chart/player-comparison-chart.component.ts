import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { CompetitorHistory } from '../competitor-history';

@Component({
  selector: 'app-player-comparison-chart',
  templateUrl: './player-comparison-chart.component.html',
  styleUrls: ['./player-comparison-chart.component.less']
})
export class PlayerComparisonChartComponent implements OnInit {
  @Input() histories !: CompetitorHistory[]
  constructor() { }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges) {
    for (const propName in changes) {
      if (changes.hasOwnProperty(propName)) {
        let change = changes[propName];
        switch (propName) {
          case 'histories': {
            if (Array.isArray(change.currentValue) && change.currentValue.length){
              change.currentValue.forEach((history : CompetitorHistory) => {
                history.percentWon = 0 /*history.nbrWonAgainst / (history.nbrWonAgainst  + history.nbrLostAgainst) * 100;*/
                history.displayedPercentWon = history.percentWon < 10 ? 10 : history.percentWon;
              });
              console.log({"histories":change.currentValue})
            }
          }
          break;
        }
      }
    }
  }

}
