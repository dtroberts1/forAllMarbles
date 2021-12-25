import { Component, ElementRef, Input, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
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
  bidMessageEditMode : boolean = false;
  bidAmtEditMode : boolean = false;
  detailChangesPending : boolean = false;
  @ViewChild('bidMessageInput') bidMessageInput!: ElementRef;
  @ViewChild('bidAmtInput') bidAmtInput !: ElementRef;
  bidMessageFormControl = new FormControl('', [Validators.required]);
  bidAmtFormControl = new FormControl('', [Validators.required]);
  amountPositionX !: number;

  expandedIndex = 0;

  constructor(
    private bidService: BidService,

  ) { }

  ngOnInit(): void {
    this.setFormControlInputs();
    setTimeout(() => {
      if (this.bidAmtInput && this.bidAmtInput.nativeElement){
        this.amountPositionX = this.bidAmtInput.nativeElement.offsetLeft;
      }

    }, 3000);

  }
  updateBid(bid: Bid){
    let currBid = bid as any;
    currBid.isEditing = false;

    
    this.bidService.update(currBid.key, currBid)
      .then(() => {
      });
  }

  setFormControlInputs(){
    this.bidMessageFormControl.setValue((<Bid>this.bid).bidMessage);
    this.bidAmtFormControl.setValue((<Bid>this.bid).bidAmount);
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
  detailDataChanged(){
    this.detailChangesPending = true;
  }

  cancelDetailChanges(){
    this.detailChangesPending = false;
    this.bidMessageEditMode = false;
    this.bidAmtEditMode = false;
    this.setFormControlInputs();
  }

  saveUpdate(){
    let thisBid = this.bid as Bid;  

    let bidForSave = {
      key : thisBid.key,
      title : thisBid.title,
      bidAmount : this.bidAmtFormControl.value,
      bidCreatorKey : thisBid.bidCreatorKey,
      bidMessage : this.bidMessageFormControl.value,
      bidCreatorChallengerKey : thisBid.bidCreatorChallengerKey,
      bids : thisBid.bids,
      rootBidKey : thisBid.rootBidKey,
      parentPath: thisBid.parentPath,
    };
    this.bidService.update(<string>(<Bid>this.bid).key, bidForSave)
      .then(() => {
        this.setFormControlInputs();
      })
      .catch((err) => {
        this.cancelDetailChanges();
      })
  }
  
  getInputErrorMessage(inputField : any){
    
    if (inputField.hasError('required')) {
      return 'You must enter a value';
    }
    if (inputField.hasError(inputField)){
        return "Not a valid entry";
    }
    return "";
  }


  modifyBid(bid: Bid){
    let currBid = bid as any;
    currBid.isEditing = true;
  }
  enableBidMessageEditMode(){
    this.bidMessageEditMode = true;
    this.bidMessageInput.nativeElement.focus();
  }

  enableBidAmtEditMode(){
    this.bidAmtEditMode = true;
    this.bidAmtInput.nativeElement.focus();
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
