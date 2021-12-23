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
        console.log("saved..")
      });
  }

  cancelModify(bid: Bid){
    let currBid = bid as any;
    currBid.isEditing = false;
  }

  deleteBid(bid: Bid){
    this.bidService.delete(<string>bid.key)
      .then((res) => {
      })
  }

  modifyBid(bid: Bid){
    let currBid = bid as any;
    currBid.isEditing = true;
  }

  ngOnInit(): void {
    console.log("in init..")
    this.authUser = this.authService.getAccount();
    let me = this;

    this.bidService.getBidsForUser(<string>this.authUser?.key)
      .subscribe({
        next(bids: Bid[]){
          if (Array.isArray(bids)){
            me.myBids = bids;
          }
        },
        error(err){
          console.log("error:" + err);

        },
      });
  }

  /*
  ngOnChanges(changes: SimpleChanges) {
    for (const propName in changes) {
      if (changes.hasOwnProperty(propName)) {
        let change = changes[propName];

      }
    }
  }
  */
}
