import { Component, Input, OnInit } from '@angular/core';
import Handsontable from 'handsontable';
import { filter, firstValueFrom, map } from 'rxjs';
import { Bid } from '../models/bid';
import { AuthUser, User } from '../models/user';
import { AuthService } from '../services/auth.service';
import { BidService } from '../services/bid.service';
import { UserService } from '../services/user.service';
import { CompetitorHistory } from '../competitor-history';
import { BidStats } from '../bid-stats';

type BidNameWithDateAndAmt = {bidName: string, bidAmount: number, date: Date, usersCompetitor : string};
type CellData = {bidName: string, bidAmount: number, outcome: string, dateStr: string, competitor: string, usersCompetitor : string};

const HEADERS: string[] = [
  'Bid Name', 'Date Completed', 'Competitor', 'Outcome', 'Bid Amount',
]

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

    hotInstance.table.tHead?.childNodes[0].childNodes.forEach((node) => {
      if (node.firstChild && node.firstChild.parentElement){
        node.firstChild.parentElement.style.backgroundColor = "#FF4A4A !important";
      }
    });
    if (row == 2 && col > 1){
      TD.style.backgroundColor = "blue";
    }


    TD.style.background = '#ffffff';
    TD.style.fontSize = '19px'; 
    TD.style.fontWeight = '500';
    TD.style.padding = "5px 5px 5px 12px";
    
    TD.onmousedown = ((ev: FocusEvent) => {
      ev.stopPropagation();
    });

    //TD.parentElement

    if (parseInt(value) < 0 && prop != 'dateStr'){
      TD.style.color = '#FF4A4A';
    }
    else if(parseInt(value) > 0 && prop != 'dateStr'){
      TD.style.color = "forestgreen";
    }

    if (value){
      let index = (<string>value).toString()?.indexOf('$');
      if (index != -1){
        let val = parseInt(value.toString().substring(1, value.toString().length));
        if (!isNaN(val)){
          if (val < 0){
            TD.style.color = '#FF4A4A';
          }
          else{
            TD.style.color = "forestgreen";
          }
          TD.style.fontWeight = 'bolder';
        }
      }
    }

    if (value === 'Lost'){
      TD.style.color = '#FF4A4A';
      TD.style.fontWeight = 'bold';
    }
    else if(value === 'Won'){
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
  @Input() isThemeDark !: boolean;
  data !:CellData[];
  authUser !:AuthUser | null;
  user !: User | undefined;
  todaysBidStats !: BidStats;
  yesterdaysBidStats !: BidStats;
  trend !: BidStats;

  competitorHistories !: CompetitorHistory[];
  dataset!: any[];
    hotSettings: Handsontable.GridSettings = {
    startRows: 5,
    
    rowHeaders: true,
    colHeaders: true,
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
    colWidths: [270, 150, 270, 80, 130],
    
    licenseKey: 'non-commercial-and-evaluation'
  };
  
  constructor(
    private bidService: BidService,
    private authService: AuthService,
    private userService: UserService,
  ) { }

  ngOnInit(): void {


    this.authUser = this.authService.getAccount();
    if (this.authUser){
      firstValueFrom(this.userService.getAll())
        .then((allUsers) => {
          if (Array.isArray(allUsers)){
            this.bidService.getAll()
            .subscribe( 
              (
                (bids: Bid[]) => {
                  this.data = [];
      
                  if (Array.isArray(bids)){
                    // Only apply updates to the root if the count has changed.
                    if (this.authUser){
                      
                      this.data = bids
                        .filter(bid => bid.title === 'Total' || bid.bidCreatorChallengerKey?.includes(<string>this.authUser?.key) && 
                          bid.resultVerified && (bid.verifiedLoser == (<AuthUser>this.authUser)?.key || 
                          bid.verifiedWinner == (<AuthUser>this.authUser)?.key))
                        .map((bid) => <BidNameWithDateAndAmt>{
                          bidName: bid.title,
                          bidAmount: bid.verifiedLoser == ((<AuthUser>this.authUser)?.key) ? 
                            -1 * <number>bid.bidAmount :
                            <number>bid.bidAmount,
                          date: bid.verifiedDate,
                          usersCompetitor: bid.verifiedWinner === ((<AuthUser>this.authUser)?.key) ? bid.verifiedLoser : bid.verifiedWinner,
                        })
                        .map((bid : BidNameWithDateAndAmt) => <CellData>{
                          outcome: bid.bidAmount > 0? 'Won' : 'Lost',
                          dateStr:bid.date ? bid.date.toString().slice(0, bid.date.toString().indexOf('T')) : '',
                          competitor: bid.usersCompetitor,
                          ...bid,
                        });
      
                      this.dataset = this.data;
                      this.user = allUsers.find(user => user.key == this.authUser?.key);
                      this.getReducedBidsBetweenUserCompetitor(allUsers);
                      this.todaysBidStats = this.getBidStats(new Date(), this.data);                 

                      let yesterdaysDate = new Date(new Date().setDate(new Date().getDate()-1));
                      this.yesterdaysBidStats = this.getBidStats(yesterdaysDate, this.data);
                      this.setTrendData(this.yesterdaysBidStats, this.todaysBidStats);
                    }
                  }
                  else{
                    this.data = [];
                  }
              }
            ));
          }
      });
      
    }
  }
  

  getReducedBidsBetweenUserCompetitor(users: User[]){
    this.competitorHistories = [];

    if (Array.isArray(this.data) && this.data.length){
      for(let user of users){
        let competitorBids = this.data.filter(data => data.usersCompetitor === user.key);
        if (Array.isArray(competitorBids) && competitorBids.length){
          this.competitorHistories.push({
            deficit: competitorBids.map(itm => itm.bidAmount).reduce((a, b) => a+b),
            nbrWonAgainst: competitorBids.filter(itm => itm.outcome === "Won").length,
            nbrLostAgainst: competitorBids.filter(itm => itm.outcome === "Lost").length, 
            competitorName: user.firstName ? user.firstName : '',
            competitorImgSrc: user.profilePicSrc ? user.profilePicSrc : '',
          });
        }
      }
    }
  }

  setTrendData(yesterdayStats: BidStats, todayStats: BidStats){

    this.trend = {
      wLRatio: todayStats.wLRatio - yesterdayStats.wLRatio,
      totalEarnings: todayStats.totalEarnings - yesterdayStats.totalEarnings,
      greatestWinYet : todayStats.greatestWinYet - yesterdayStats.greatestWinYet,
      worstLossYet : todayStats.worstLossYet - yesterdayStats.worstLossYet,
      averageEarnings : todayStats.averageEarnings - yesterdayStats.averageEarnings,
      totalBidCount : todayStats.totalBidCount - yesterdayStats.totalBidCount,
    }

  }

  getBidStats(date: Date, data: CellData[]){

    date.setHours(0,0,0,0);

    let stats : BidStats = {
      wLRatio: 0,
      totalEarnings: 0,
      greatestWinYet: 0,
      greatestWinBidName: '',
      worstLossYet: 0,
      worstLossBidName: '',
      averageEarnings: 0,
      totalBidCount: 0,
    }

    let myDate = new Date(data[0].dateStr.replace(/-/g, '\/'));
    myDate.setHours(0,0,0,0);

    let filteredByDate = data.filter(itm => new Date(itm.dateStr.replace(/-/g, '\/')).setHours(0,0,0,0) <= date.setHours(0,0,0,0));
    if (Array.isArray(filteredByDate) && filteredByDate.length){
      stats.wLRatio = this.getWLRatioThroughDate(filteredByDate);
      stats.totalEarnings = this.getTotalEarnings(filteredByDate);
      let greatestWinBid: CellData | null = this.greatestWin(filteredByDate);
      if (greatestWinBid){
        stats.greatestWinYet = <number>greatestWinBid.bidAmount;
        stats.greatestWinBidName = <string>greatestWinBid.bidName;
      }
      let worstLossBid: CellData | null = this.greatestLoss(filteredByDate);
      if (worstLossBid){
        stats.worstLossYet = <number>worstLossBid.bidAmount;
        stats.worstLossBidName = <string>worstLossBid.bidName;
      }
      stats.averageEarnings = this.getAverageEarnings(filteredByDate);
      stats.totalBidCount = filteredByDate.length;
    }
    else{

    }
    return stats;

  }

  getWLRatioThroughDate(data: CellData[]) : number{
    if (Array.isArray(data) && data.length){
      let wins = data.filter(itm => itm.outcome === "Won").length;
      let losses = data.filter(itm => itm.outcome === "Lost").length;
      return wins / (wins + losses);
    }
    else{
      return 0;
    }
  }

  getTotalEarnings(data: CellData[]) : number{
    if (Array.isArray(data) && data.length){
      return parseInt(data.map(itm => itm.bidAmount).reduce((a,b) => a+b).toFixed(2));
    }
    else{
      return 0;
    }
  }
  getAverageEarnings(data: CellData[]) : number{
    if (Array.isArray(data) && data.length){
      return parseInt((this.getTotalEarnings(data) / data.length).toFixed(2));
    }
    else{
      return 0;
    }
  }
  greatestWin(data: CellData[]): CellData | null{
    if (Array.isArray(data) && data.length){
      return data.reduce((a, b) => Math.max(a.bidAmount, b.bidAmount) === a.bidAmount ? a : b);
    }
    else{
      return null;
    }
  }
  greatestLoss(data: CellData[]): CellData | null{
    if (Array.isArray(data) && data.length){
      return data.reduce((a, b) => Math.min(a.bidAmount, b.bidAmount) === a.bidAmount ? a : b);
    }
    else{
      return null;
    }
  }
}
