import { Component, Input, OnInit } from '@angular/core';
import { Bid } from '../models/bid';
import { BidService } from '../services/bid.service';

@Component({
  selector: 'app-nested-accordion',
  templateUrl: './nested-accordion.component.html',
  styleUrls: ['./nested-accordion.component.less']
})
export class NestedAccordionComponent implements OnInit {
  @Input() bid !: Bid | any;

  items = ['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5'];
  expandedIndex = 0;

  constructor(
    private bidService: BidService,

  ) { }

  ngOnInit(): void {
    console.log({"bid":this.bid})
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
}
