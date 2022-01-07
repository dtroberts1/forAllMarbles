import { Component, ElementRef, EventEmitter, Input, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Bid } from '../models/bid';
import { AuthUser, User } from '../models/user';
import { AuthService } from '../services/auth.service';
import { BidService } from '../services/bid.service';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-create-new-bid',
  templateUrl: './create-new-bid.component.html',
  styleUrls: ['./create-new-bid.component.less']
})
export class CreateNewBidComponent implements OnInit {
  bidAmt!: number;
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
  bidAmtFormControl = new FormControl('', [Validators.required, Validators.pattern(/^\d+(?:\.\d{0,2})$/)]);
  titleFormControl = new FormControl('', [Validators.required]);

  amountPositionX !: number;
  @Output() refreshCallback: EventEmitter<any> = new EventEmitter();
  constructor(
    private bidService: BidService,
    private userService: UserService,
    private authService: AuthService,
  ) { }


  createBid(){
    let key = this.authService.getAccount()?.key;
    if (key){
      this.userService.getSingle(key)
        .then((user : User) => {
          this.bidService.create(
            {
              title: this.titleFormControl.value,
              bidAmount : this.bidAmtFormControl.value,
              bidCreatorKey : user.key,
              bidMessage : this.bidMessageFormControl.value,
              bidCreatorChallengerKey: user.key,
              rootBidKey: 'root',
              bidChallengerKey : 'NULL',
              parentPath: '/bids/',
              isApproved: false,
              hasResult: false,
              resultVerified: false,
              isCancelled: false,
              declaredWinner: null,
              declaredLoser: null,
            }
          )
            .then((res : {key: string}) => {
              // Create Bid reference for the user
              let existingBids = user.bids ? user.bids : [];

              if (res) {
                existingBids?.push(res.key);
                this.userService.update(<string>user.key, 
                  {
                    key : user.key,
                    bids : existingBids,
                    displayName : user.displayName,
                    emailAddress : user.emailAddress,
                  }
                );
              }
              this.bidAmt = null as any;
            }).finally(() => {
              this.clearFields();
            })
        }).finally(() => {
          this.cancelDetailChanges();
        })
    }
  }

  clearFields(){
    this.cancelDetailChanges();
    this.titleFormControl.setValue(null);
    this.bidMessageFormControl.setValue(null);
    this.bidAmtFormControl.setValue(0.00);
  }

  ngOnInit(): void {
    this.setFormControlInputs();

  }
  updateBid(bid: Bid){
    let currBid = bid as any;
    currBid.isEditing = false;

    
    this.bidService.update(currBid.key, currBid)
      .then(() => {
      });
  }

  setFormControlInputs(){

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
      isApproved : false,
      hasResult : false,
      resultVerified : false,
      isCancelled : false,
      declaredWinner: null,
      declaredLoser: null,
    });
    this.refreshBid(this.bid);
  }

  cancelModify(bid: Bid){
    let currBid = bid as any;
    currBid.isEditing = false;
  }

  deleteBid(bid: Bid){
    this.bidService.delete(<string>bid.parentPath, <string>bid.key)
      .then((res : any) => {
        // Notify parent to call its refreshBid()
        if (this.parentBid){
          this.refreshCallback.emit([this.parentBid]);
        }
        else{
          this.refreshCallback.emit([null]);
        }
      })
      .catch((err : any) => {
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


    console.log("amount is " + this.bidAmtFormControl.value)

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
        isNew: thisBid.isNew,
        isApproved : thisBid.isApproved,
        hasResult : thisBid.hasResult,
        resultVerified : thisBid.resultVerified,
        isCancelled : thisBid.isCancelled,
        declaredWinner: thisBid.declaredWinner,
        declaredLoser: thisBid.declaredLoser,
      };

      this.bidService.update(<string>(<Bid>this.bid).key, bidForSave)
      .then(() => {
        // Get Updated bid
        this.refreshBid(this.bid);
      })
      .catch((err : any) => {
        this.cancelDetailChanges();
      });
  }

  refreshBid(myBid: Bid){
    this.bidService.getSingleBid(myBid)
      .then((res : Bid) => { 
        this.cancelDetailChanges();

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
            myBid.isApproved = bid.isApproved;
            myBid.hasResult = bid.hasResult;
            myBid.resultVerified = bid.resultVerified;
            myBid.isCancelled = bid.isCancelled;
            myBid.declaredWinner = bid.declaredWinner,
            myBid.declaredLoser = bid.declaredLoser,
            this.setFormControlInputs();
            if (bid){
              let bids = this.bidService.getBidsRecursively( bid.bids);
              myBid.bids = bids;
            }

          }
    }).catch((err : any) => {
      this.cancelDetailChanges();
    })
  }
  
  getInputErrorMessage(inputField : any){
    
    if (inputField.hasError('required')) {
      return 'error';
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

  incrementAmt(){
    this.detailDataChanged(this.bidAmtEditMode);
    if (!this.bidAmtFormControl.value){
      this.bidAmtFormControl.setValue(0.00);
    }

    
    this.bidAmtFormControl.setValue(this.bidAmtFormControl.value + .01);

    if (this.bidAmtFormControl.value < 0){
      this.bidAmtFormControl.setValue(0.00);
    }

    this.bidAmtFormControl.setValue(Math.round(this.bidAmtFormControl.value * 100) / 100);

  }

  decrementAmt(){
    this.detailDataChanged(this.bidAmtEditMode);
    if (!this.bidAmtFormControl.value){
      this.bidAmtFormControl.setValue(0.00);
    }
    
    this.bidAmtFormControl.setValue(this.bidAmtFormControl.value - .01);

    if (this.bidAmtFormControl.value < 0){
      this.bidAmtFormControl.setValue(0.00);
    }
    this.bidAmtFormControl.setValue(Math.round(this.bidAmtFormControl.value * 100) / 100);

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
