import { Component, OnInit } from '@angular/core';
import { Bid } from '../models/bid';
import { BidService } from '../services/bid.service';

@Component({
  selector: 'app-feed',
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.less']
})
export class FeedComponent implements OnInit {
  allBids!: (Bid | any)[];

  constructor(
    private bidService: BidService,
  ) { }

  ngOnInit(): void {
    let me = this;
    this.bidService.getAll()
    .subscribe({
      next(bids: Bid[]){
        if (Array.isArray(bids)){
          console.log({"allbids":bids})
          me.allBids = bids;
        }
      },
      error(err){
        console.log("error:" + err);

      },
    });
  }

}
