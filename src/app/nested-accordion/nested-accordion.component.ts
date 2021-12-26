import { Component, ElementRef, EventEmitter, Input, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
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
  @Input() parentBid !: Bid;
  bidMessageEditMode : boolean = false;
  bidAmtEditMode : boolean = false;
  titleEditMode : boolean = false;
  detailChangesPending : boolean = false;
  @ViewChild('bidMessageInput') bidMessageInput!: ElementRef;
  @ViewChild('bidAmtInput') bidAmtInput !: ElementRef;
  @ViewChild('titleInput') titleInput !: ElementRef;
  bidMessageFormControl = new FormControl('', [Validators.required]);
  bidAmtFormControl = new FormControl('', [Validators.required]);
  titleFormControl = new FormControl('', [Validators.required]);

  amountPositionX !: number;
  @Output() refreshCallback: EventEmitter<any> = new EventEmitter();

  
  expandedIndex = 0;

  constructor(
    private bidService: BidService,

  ) { }

  ngOnInit(): void {
    //this.theBoundCallback = this.refreshBid.bind(this);

    this.setFormControlInputs();
    /*
    setTimeout(() => {
      if (this.bidAmtInput && this.bidAmtInput.nativeElement){
        this.amountPositionX = this.bidAmtInput.nativeElement.offsetLeft;
      }

    }, 3000);
    */

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
    this.titleFormControl.setValue((<Bid>this.bid).title);
  }

  createCounterOffer(){
    let parentBid = (<Bid>this.bid);

    this.bidService.addNewChildToParent({
      title : '__________',
      bidAmount : 0,
      bidChallengerKey : parentBid.bidCreatorKey,
      bidCreatorKey : this.user?.key,
      bidMessage : '__________',
      bidCreatorChallengerKey : `${this.user?.key}_${parentBid.bidCreatorKey}`, 
      rootBidKey : parentBid.rootBidKey === 'root' ? parentBid.key : parentBid.rootBidKey,
      parentPath : `${parentBid.parentPath}${parentBid.key}/bids/`,
      isNew: true,
    });
    this.refreshBid(this.bid);
  }

  cancelModify(bid: Bid){
    let currBid = bid as any;
    currBid.isEditing = false;
  }

  deleteBid(bid: Bid){
    this.bidService.delete(<string>bid.parentPath, <string>bid.key)
      .then((res) => {
        // Notify parent to call its refreshBid()
        if (this.parentBid){
          this.refreshCallback.emit([this.parentBid]);
        }
        else{
          this.refreshCallback.emit([null]);
        }
      })
      .catch((err) => {
      })
  }
  detailDataChanged(canPendChanges: boolean | null){
    if (canPendChanges){
      this.detailChangesPending = true;
    }
  }

  cancelDetailChanges(){
    // For Creator
    this.detailChangesPending = false;
    this.bidMessageEditMode = false;
    this.bidAmtEditMode = false;
    this.titleEditMode = false;
    this.setFormControlInputs();
  }

  saveUpdate(){
    let thisBid = this.bid as Bid;  
      let bidForSave : Bid = {
        title : this.titleFormControl.value,
        bidAmount : this.bidAmtFormControl.value,
        bidCreatorKey : thisBid.bidCreatorKey,
        bidChallengerKey: thisBid.bidChallengerKey,
        bidMessage : this.bidMessageFormControl.value,
        bidCreatorChallengerKey : thisBid.bidCreatorChallengerKey,
        bids : thisBid.bids,
        rootBidKey : thisBid.rootBidKey,
        parentPath: thisBid.parentPath,
        isNew: false,
      };

      this.bidService.update(<string>(<Bid>this.bid).key, bidForSave)
      .then(() => {
        // Get Updated bid
        this.refreshBid(this.bid);
      })
      .catch((err) => {
        this.cancelDetailChanges();
      });
  }

  refreshBid(myBid: Bid){
    this.cancelDetailChanges();
    this.bidService.getSingleBid(myBid)
      .then((res : Bid) => { 
          let bid = res;
          if (bid){
            myBid.bidAmount = bid.bidAmount;
            myBid.bidChallengerKey = bid.bidChallengerKey;
            myBid.bidCreatorChallengerKey = bid.bidCreatorChallengerKey;
            myBid.bidCreatorKey = bid.bidCreatorKey;
            myBid.bidMessage = bid.bidMessage;
            myBid.key = bid.key;
            myBid.parentPath = bid.parentPath;
            myBid.rootBidKey = bid.rootBidKey;
            myBid.title = bid.title;
            this.setFormControlInputs();
            if (bid){
              let bids = this.bidService.getBidsRecursively( bid.bids);
              myBid.bids = bids;
            }

          }
    });
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
  enableBidMessageEditMode(event: any){
    event.stopPropagation();
    if (this.user && this.user.key === this.bid.bidCreatorKey){
      this.bidMessageEditMode = true;
      this.bidMessageInput.nativeElement.focus();
    }
  }

  enableBidAmtEditMode(event: any){
    event.stopPropagation();
    if (this.user && this.user.key === this.bid.bidCreatorKey){
      this.bidAmtEditMode = true;
      this.bidAmtInput.nativeElement.focus();
    }
  }

  stopPropagation(event: any, isExpanded : boolean){
    if (isExpanded){
      event.stopPropagation();
    }
  }

  enableTitleEditMode(event: any){
    event.stopPropagation();
    if (this.user && this.user.key === this.bid.bidCreatorKey){
      this.titleEditMode = true;
      this.titleInput.nativeElement.focus();
    }
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
