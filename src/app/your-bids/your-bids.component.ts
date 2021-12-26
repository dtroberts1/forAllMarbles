import { Component, OnInit, SimpleChanges } from '@angular/core';
import { Bid } from '../models/bid';
import { AuthUser } from '../models/user';
import { AuthService } from '../services/auth.service';
import { BidService } from '../services/bid.service';


@Component({
  selector: 'app-your-bids',
  templateUrl: './your-bids.component.html',
  styleUrls: ['./your-bids.component.less']
})
export class YourBidsComponent implements OnInit {
  myBids!: (Bid | any)[];
  authUser !:AuthUser | null;


  constructor(
    private bidService: BidService,
    private authService: AuthService,
    ) { 

  }

  updateBid(bid: Bid){
    let currBid = bid as any;
    currBid.isEditing = false;

    
    this.bidService.update(currBid.key, currBid)
      .then(() => {
      });
  }

  cancelModify(bid: Bid){
    let currBid = bid as any;
    currBid.isEditing = false;
  }

  deleteBid(bid: Bid){
    this.bidService.delete(<string>bid.parentPath, <string>bid.key)
      .then((res) => {
      })
  }

  modifyBid(bid: Bid){
    let currBid = bid as any;
    currBid.isEditing = true;
  }

  ngOnInit(): void {
    this.authUser = this.authService.getAccount();
    let me = this;

    this.bidService.getAll()
      .subscribe({
        next(bids: Bid[]){
          if (Array.isArray(bids)){
            me.myBids = me.getBidsFilteredByUser(bids, <string>me.authUser?.key);
          }
        },
        error(err){
          console.log("error:" + err);

        },
      });
  }

  getBidsFilteredByUserHelper(bid: Bid, userKey: string){
    let bids : Bid[] = [];
    if (bid == null){
      return []
    }
    if (bid.bidCreatorKey == userKey){
      bids.push(bid);
      return bids;
    }
    else if(Array.isArray(bid.bids) && bid.bids.length){
      bid.bids.forEach((currBid) => {
        let filteredBids = this.getBidsFilteredByUserHelper(currBid, userKey);
        if(Array.isArray(filteredBids) && filteredBids.length){
          bids = [...bids, ...filteredBids];
        }
      });
    }
    return bids;
  }

  getBidsFilteredByUser(bids: Bid[], userKey: string): Bid[]{
    let filteredBids : Bid[] = [];
    if (Array.isArray(bids) && bids.length){
      bids.forEach((bid) => {
        if (bid.bidCreatorKey == userKey){
          filteredBids.push(bid);
        }
        else{
          let tmpBids = this.getBidsFilteredByUserHelper(bid, userKey);
          if (Array.isArray(tmpBids) && tmpBids.length){
            filteredBids = [...filteredBids, ...tmpBids];
          }
        }
      });
    }

    return filteredBids;

  }
}
