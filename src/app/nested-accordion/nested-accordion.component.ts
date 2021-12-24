import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { Bid } from '../models/bid';
import { AuthUser } from '../models/user';
import { BidService } from '../services/bid.service';

@Component({
  selector: 'app-nested-accordion',
  templateUrl: './nested-accordion.component.html',
  styleUrls: ['./nested-accordion.component.less']
})
export class NestedAccordionComponent implements OnInit {
  @Input() bid !: Bid | any;
  @Input() user !:AuthUser | null;

  expandedIndex = 0;

  constructor(
    private bidService: BidService,

  ) { }

  ngOnInit(): void {

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
    this.bidService.delete(<string>bid.key)
      .then((res) => {
      })
  }

  modifyBid(bid: Bid){
    let currBid = bid as any;
    currBid.isEditing = true;
  }

  
  ngOnChanges(changes: SimpleChanges) {
    for (const propName in changes) {
      if (changes.hasOwnProperty(propName)) {
        let change = changes[propName];
        switch (propName) {
          case 'user': {
          }
          break;
          case 'bid':{
          }
          break;
        }
      }
    }
  }
}
