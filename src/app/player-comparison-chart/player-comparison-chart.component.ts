import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { CompetitorHistory } from '../competitor-history';
import { User } from '../models/user';

@Component({
  selector: 'app-player-comparison-chart',
  templateUrl: './player-comparison-chart.component.html',
  styleUrls: ['./player-comparison-chart.component.less']
})
export class PlayerComparisonChartComponent implements OnInit {
  @Input() histories !: CompetitorHistory[]
  @Input() user !: User | undefined;
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
                history.percentWon = parseInt(Math.round(history.nbrWonAgainst / (history.nbrWonAgainst  + history.nbrLostAgainst) * 100).toFixed(2));
                history.displayedPercentWon = history.percentWon < 10 ? 10 : history.percentWon;
              });
            }
          }
          break;
        }
      }
    }
  }

}
