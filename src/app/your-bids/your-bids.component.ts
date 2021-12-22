import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
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
        console.log("removed..")
      })
  }

  modifyBid(bid: Bid){
    let currBid = bid as any;
    currBid.isEditing = true;
  }

  ngOnInit(): void {
    this.authUser = this.authService.getAccount();

    this.bidService.getBidsForUser(<string>this.authUser?.key);
  }

}
