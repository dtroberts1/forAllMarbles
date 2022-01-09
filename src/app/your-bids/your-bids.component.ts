import { Component, OnInit, SimpleChanges } from '@angular/core';
import { firstValueFrom } from 'rxjs';
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

  public accordionBaseCallback(){
    this.bidService.getAll()
      .subscribe( 
        (
          (bids: Bid[]) => {
          if (Array.isArray(bids)){
            // Only apply updates to the root if the count has changed.
            this.myBids = this.bidService.getBidsFilteredByUser(bids, <string>this.authUser?.key);
          }
          else{
            this.myBids = [];
          }
        }
      ));
}

  modifyBid(bid: Bid){
    let currBid = bid as any;
    currBid.isEditing = true;
  }

  ngOnInit(): void {
    this.authUser = this.authService.getAccount();

    firstValueFrom(
      this.bidService.getAll())
        .then((bids: Bid[]) => {
          if (Array.isArray(bids)){
            this.myBids = this.bidService.getBidsFilteredByUser(bids, <string>this.authUser?.key);
          }
          else{
            this.myBids = [];
          }
        })
        .catch((err) => {
        });
  }

  public accordionCallback(){
    firstValueFrom(
      this.bidService.getAll())
        .then((bids: Bid[]) => {
          if (Array.isArray(bids)){
            // Only apply updates to the root if the count has changed.
            this.myBids = this.bidService.getBidsFilteredByUser(bids, <string>this.authUser?.key);
          }
          else{
            this.myBids = [];
          }
        });
  }


  ngOnChanges(changes: SimpleChanges) {
    for (const propName in changes) {
      if (changes.hasOwnProperty(propName)) {
        let change = changes[propName];

      }
      else{
      }
    }
  }
}
