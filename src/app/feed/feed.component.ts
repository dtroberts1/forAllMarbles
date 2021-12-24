import { Component, OnInit } from '@angular/core';
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

  constructor(
    private bidService: BidService,
    private authService: AuthService,
  ) { }

  ngOnInit(): void {
    let me = this;
    this.authUser = this.authService.getAccount();

    this.bidService.getAll()
    .subscribe({
      next(bids: Bid[]){
        if (Array.isArray(bids)){
          me.allBids = me.getCounterableBids(bids);
        }
      },
      error(err){
        console.log("error:" + err);

      },
    });
  }

  getCounterableBidsHelper(bid: Bid, user: AuthUser) :Bid[]{
    let tmpArray : Bid[] = [];
    if (user){
    }
    else{
    }
    if (!bid.rootBidKey || bid.bidCreatorKey == user.key || bid.bidChallengerKey == user.key){
      if (Array.isArray(bid.bids) && bid.bids.length){
        bid.bids.forEach((tmpBid) => {
          tmpArray = [...tmpArray, ...this.getCounterableBidsHelper(tmpBid, <AuthUser>this.authUser)];
        });
      }
      tmpArray.push(bid);
    }

    return tmpArray;
  }

  getCounterableBids(allBids: Bid[]) : Bid[]{
    let availableBids : Bid[] = [];
    // Get all bids as long as they are either not counter offers, 
      // or are counter offers but were not created by someone other than the user

    let rootBids = allBids.filter(bid => bid.rootBidKey == null);
    rootBids.forEach((rootBid) => {
      if (Array.isArray(rootBid.bids)){
        availableBids = [...availableBids, ...this.getCounterableBidsHelper(rootBid, <AuthUser>this.authUser)];
      }
    });

    return availableBids;
  }

}
