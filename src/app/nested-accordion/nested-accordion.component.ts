import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, ElementRef, EventEmitter, Input, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { DocManagementModalComponent } from '../doc-management-modal/doc-management-modal.component';
import { Bid } from '../models/bid';
import { SupportingDoc } from '../models/supporting-doc';
import { AuthUser } from '../models/user';
import { BidService } from '../services/bid.service';

@Component({
  selector: 'app-nested-accordion',
  templateUrl: './nested-accordion.component.html',
  styleUrls: ['./nested-accordion.component.less'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
    trigger('openClose', [
      // ...
      state('open', style({
        transform: 'rotate(0deg)'
      })),
      state('closed', style({
        transform: 'rotate(-180deg)'
      })),
      transition('open => closed', [
        animate('1s')
      ]),
      transition('closed => open', [
        animate('1s')
      ]),
    ]),
  ],
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
  attachedFile !: File;
  hasWinnerDocs : boolean = false;

  amountPositionX !: number;
  @Output() refreshCallback: EventEmitter<any> = new EventEmitter();

  
  expandedIndex = 0;

  constructor(
    private bidService: BidService,
    public dialog: MatDialog,

  ) { }

  ngOnInit(): void {
    //this.theBoundCallback = this.refreshBid.bind(this);
    console.log({"this.bid":this.bid})
    this.hasWinnerDocs = this.getHasWinnerDocs();

    this.setFormControlInputs();

  }

  getHasWinnerDocs(){

    let notDeclaredWinner = !(this.user && this.user.key && this.user.key == this.bid.declaredWinner);
    if (notDeclaredWinner){
      return false;
    }

    let supportingDocsArray : SupportingDoc[] = Object.values(this.bid.winnerSupportingDocs).map((doc : any) => <SupportingDoc>{
      name: doc.name, isLinked: doc.isLinked, url: doc.url, notes: doc.notes, path : doc.path,
    });

    if (Array.isArray(supportingDocsArray) && supportingDocsArray.length){
      return true;
    }
    else{
      return false;
    }
  }

  approveBid(bid: Bid){
    bid.isApproved = true;

    this.bidService.update(<string>bid.key, bid)
    .then(() => {
    });
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

  declareVictory(bid: Bid){
    bid.hasResult = true;
    bid.resultVerified = false;
    bid.declaredWinner = this.user?.key;
    bid.declaredLoser = bid.bidCreatorKey != this.user?.key ? bid.bidCreatorKey : bid.bidChallengerKey;

    this.bidService.update(<string>bid.key, bid)
    .then(() => {
    })
    .catch((err) => console.log("error: "+ err))
  }
  
  concedeDefeat(bid: Bid){
    bid.hasResult = true;
    bid.resultVerified = true;
    bid.declaredWinner = bid.bidCreatorKey != this.user?.key ? bid.bidCreatorKey : bid.bidChallengerKey;
    bid.declaredLoser = this.user?.key;
    bid.verifiedLoser = this.user?.key;
    bid.verifiedWinner = bid.declaredWinner;

    // Update Win/Loss Status -- TODO
    // Distribute Funds -- TODO

    this.bidService.update(<string>bid.key, bid)
    .then(() => {
    })
    .catch((err) => console.log("error: "+ err))
  }

  challengeResult(bid: Bid){
    let isWinner = this.user && this.user.key && this.user.key == this.bid.declaredWinner;
    const dialogRef = this.dialog.open(DocManagementModalComponent, {
      width: '550px',
      height: '640px',
      data: {
        attachedFile: null,
        isWinner: isWinner,
        bid: this.bid,
      },
      panelClass: 'modal-class'
    });

    dialogRef.afterClosed().subscribe(result => {
      this.bidService.getSingleBid(this.bid)
      .then((res) => {
        this.bid = res;
        this.hasWinnerDocs = this.getHasWinnerDocs();
      });
    });
  }

  manageDocumentation(){
    let isWinner = this.user && this.user.key && this.user.key == this.bid.declaredWinner;
    const dialogRef = this.dialog.open(DocManagementModalComponent, {
      width: '550px',
      height: '640px',
      data: {
        attachedFile: null,
        isWinner: isWinner,
        bid: this.bid,
      },
      panelClass: 'modal-class'
    });

    dialogRef.afterClosed().subscribe(result => {
      this.bidService.getSingleBid(this.bid)
      .then((res) => {
        this.bid = res;
        this.hasWinnerDocs = this.getHasWinnerDocs();
      });
    });
  }

  attachmentAdded(event: any, bid: Bid){
    if (event.target.files){
      this.attachedFile = event.target.files.item(0);
    }

    if (this.user){
    }
    let isWinner = this.user && this.user.key && this.user.key == bid.declaredWinner;
    const dialogRef = this.dialog.open(DocManagementModalComponent, {
      width: '550px',
      height: '640px',
      data: {
        attachedFile: this.attachedFile,
        isWinner: isWinner,
        bid: bid,
      },
      panelClass: 'modal-class'
    });

    dialogRef.afterClosed().subscribe(result => {
      this.bidService.getSingleBid(this.bid)
      .then((res) => {
        this.bid = res;
        this.hasWinnerDocs = this.getHasWinnerDocs();
      });
    });
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
            this.setFormControlInputs();
            if (bid){
              let bids = this.bidService.getBidsRecursively( bid.bids);
              myBid.bids = bids;
            }

          }
    }).catch((err) => {
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
      this.bidAmtFormControl.setValue(0);
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
      this.bidAmtFormControl.setValue(0);
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