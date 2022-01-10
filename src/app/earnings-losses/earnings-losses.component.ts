import { Component, OnInit, Type } from '@angular/core';
import Handsontable from 'handsontable';
import { TextEditor } from 'handsontable/editors';
import { map } from 'rxjs';
import { Bid } from '../models/bid';
import { AuthUser } from '../models/user';
import { AuthService } from '../services/auth.service';
import { BidService } from '../services/bid.service';

type BidNameWithDateAndAmt = {bidName: string, bidAmount: number, date: Date};
type CellData = {bidName: string, bidAmount: number, outcome: string, dateStr: string, competitor: string,};

Handsontable
    .renderers
    .registerRenderer('customContainerRenderer', (hotInstance, TD, row, col, prop, value, ...rest) => {
      Handsontable.renderers.getRenderer('html')(hotInstance, TD, row, col, prop, value, ...rest);
  });

Handsontable
  .renderers
  .registerRenderer('customStylesRenderer', (hotInstance, TD, row, col, prop, value, ...rest) => {
    Handsontable.renderers.getRenderer('text')(hotInstance, TD, row, col, prop, value, ...rest);
    let wtHolder = TD.parentElement?.parentElement?.parentElement?.parentElement?.parentElement?.parentElement;
    if (wtHolder && wtHolder.className === 'wtHolder'){
      wtHolder.style.overflowY = "hidden";
    }

    TD.style.background = '#ffffff';
    TD.style.fontSize = '19px'; 
    TD.style.fontWeight = '500';
    TD.style.padding = "5px 5px 5px 12px";

    TD.onmousedown = ((ev: FocusEvent) => {
      ev.stopPropagation();
    });

    if (parseInt(value) < 0 && prop != 'dateStr'){
      TD.style.color = '#FF4A4A';
    }
    else if(parseInt(value) > 0 && prop != 'dateStr'){
      TD.style.color = "forestgreen";
    }

    if (value === 'Loss'){
      TD.style.color = '#FF4A4A';
      TD.style.fontWeight = 'bold';
    }
    else if(value === 'Win'){
      TD.style.color = 'forestgreen';
      TD.style.fontWeight = 'bold';
    }
  });

@Component({
  selector: 'app-earnings-losses',
  templateUrl: './earnings-losses.component.html',
  styleUrls: ['./earnings-losses.component.less']
})
export class EarningsLossesComponent implements OnInit {
  data !:CellData[];
  authUser !:AuthUser | null;
  dataset!: any[];
    hotSettings: Handsontable.GridSettings = {
    startRows: 5,
    
    rowHeaders: true,
    colHeaders: true,
    /*stretchH: 'last', // TODO*/
    className: 'custom-table',
    renderer: 'customContainerRenderer',
    cells: ((row :number, column :number, prop:string | number ) => {
      return {
        row: 0,
        col: 0,
        renderer: 'customStylesRenderer',
        
      }
    }),
    height: 'auto',
    
    
    columns: [

    ],
    colWidths: [250, 150, 250, 80, 100],
    
    licenseKey: 'non-commercial-and-evaluation'
  };
  
  constructor(
    private bidService: BidService,
    private authService: AuthService,
  ) { }

  ngOnInit(): void {
    this.authUser = this.authService.getAccount();
    if (this.authUser){
      
      this.bidService.getAll()
      .subscribe( 
        (
          (bids: Bid[]) => {
          if (Array.isArray(bids)){
            // Only apply updates to the root if the count has changed.
            if (this.authUser){
              
              this.data = bids
                .filter(bid => bid.bidCreatorChallengerKey?.includes(<string>this.authUser?.key) && bid.resultVerified && (bid.verifiedLoser == (<AuthUser>this.authUser)?.key || 
                  bid.verifiedWinner == (<AuthUser>this.authUser)?.key)).slice(0, 10)
                .map((bid) => <BidNameWithDateAndAmt>{
                  bidName: bid.title,
                  bidAmount: bid.verifiedLoser == ((<AuthUser>this.authUser)?.key) ? 
                    -1 * <number>bid.bidAmount :
                    <number>bid.bidAmount,
                  date: bid.verifiedDate,
                })
                .map((bid : BidNameWithDateAndAmt) => <CellData>{
                  outcome: bid.bidAmount > 0? 'Win' : 'Loss',
                  dateStr:bid.date ? bid.date.toString().slice(0, bid.date.toString().indexOf('T')) : '',
                  competitor: 'Stacy Jenkins',
                  ...bid,
                });
              this.dataset = this.data;
            }
          }
          else{
            this.data = [];
          }
        }
      ));
    }
  }

}
