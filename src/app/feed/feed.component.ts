import { Component, OnInit } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Bid } from '../models/bid';
import { AuthUser } from '../models/user';
import { AuthService } from '../services/auth.service';
import { BidService } from '../services/bid.service';

@Component({
  selector: 'app-feed',
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.less']
})
export class FeedComponent implements OnInit {
  allBids!: (Bid | any)[];
  authUser !:AuthUser | null;
  bidCount : number = 0;
  initialLoad :boolean = true;

  constructor(
    private bidService: BidService,
    private authService: AuthService,
  ) { }

  ngOnInit(): void {
    let me = this;
    this.authUser = this.authService.getAccount();

    firstValueFrom(
      this.bidService.getAll())
        .then((bids: Bid[]) => {
          if (Array.isArray(bids)){
            // Only apply updates to the root if the count has changed.
            this.allBids = this.getCounterableBids(bids);
          }
          else{
            this.allBids = [];
          }
        });
  }

  accordionCallback(){
    firstValueFrom(
      this.bidService.getAll())
        .then((bids: Bid[]) => {
          if (Array.isArray(bids)){
            // Only apply updates to the root if the count has changed.
            this.allBids = this.getCounterableBids(bids);
          }
          else{
            this.allBids = [];
          }
        });
  }

  getNbrBids(bids: Bid[]){
    let bidCount = 0;
    if (Array.isArray(bids)){
      bids.forEach((bid) => {
        if (Array.isArray(bid.bids) && bid.bids.length){
          bidCount += this.getNbrBids(bid.bids);
        }
        bidCount += 1;
      });
    }
    return bidCount;
  }

  getCounterableBidsHelper(bid: Bid, user: AuthUser, flatBidStrs : string[]) :Bid[]{
    let tmpArray : Bid[] = [];
    if (user){
      if (!bid.rootBidKey || bid.rootBidKey === 'root' || bid.bidCreatorKey == user.key || bid.bidChallengerKey == user.key){
        if (Array.isArray(bid.bids) && bid.bids.length){
          bid.bids.forEach((tmpBid) => {
            tmpArray = [...tmpArray, ...this.getCounterableBidsHelper(tmpBid, <AuthUser>this.authUser, flatBidStrs)];
          });
        }
        tmpArray.push(bid);
        flatBidStrs.push(<string>bid.key);
      }
    }
    else{
    }

    return tmpArray;
  }

  getCounterableBids(allBids: Bid[]) : Bid[]{
    let availableBids : Bid[] = [];
    let flatBidStrs : string[] = [];
    // Get all bids as long as they are either not counter offers, 
      // or are counter offers but were not created by someone other than the user

    let rootBids = allBids.filter(bid => bid.rootBidKey == null || bid.rootBidKey === 'root');
    rootBids.forEach((rootBid) => {
      if (Array.isArray(rootBid.bids)){
        availableBids = [...availableBids, ...this.getCounterableBidsHelper(rootBid, <AuthUser>this.authUser, flatBidStrs)];
      }
    });
    availableBids = availableBids.filter(bid => !bid.rootBidKey || bid.rootBidKey === 'root' || bid.rootBidKey && !flatBidStrs.includes(<string>bid.key));

    return availableBids;
  }

}