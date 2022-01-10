import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, ElementRef, EventEmitter, Input, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import { AdminChooseWinnerComponent } from '../admin-choose-winner/admin-choose-winner.component';
import { BidConfirmationDialogComponent } from '../bid-confirmation-dialog/bid-confirmation-dialog.component';
import { DocManagementModalComponent } from '../doc-management-modal/doc-management-modal.component';
import { Bid } from '../models/bid';
import { SupportingDoc } from '../models/supporting-doc';
import { AuthUser } from '../models/user';
import { BidService } from '../services/bid.service';
import { UserService } from '../services/user.service';

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
  isAdmin : boolean = false;
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
  creatorName !: string;
  unconfirmedWinnerFullName !: string;
  amountPositionX !: number;
  @Output() refreshCallback: EventEmitter<any> = new EventEmitter();
  @Output() accordionBaseCallback: EventEmitter<any> = new EventEmitter();
  
  expandedIndex = 0;

  constructor(
    private bidService: BidService,
    public dialog: MatDialog,
    private userService: UserService,
  ) { }

  ngOnInit(): void {
    this.hasWinnerDocs = this.getHasWinnerDocs();


    this.setFormControlInputs();

  }

  getHasWinnerDocs(){
    let supportingDocsArray : SupportingDoc[];
    let notDeclaredWinner = !(this.user && this.user.key && this.user.key == this.bid.declaredWinner);
    if (notDeclaredWinner){
      return false;
    }

    if (this.bid.winnerSupportingDocs){
      supportingDocsArray = Object.values(this.bid.winnerSupportingDocs).map((doc : any) => <SupportingDoc>{
        name: doc.name, isLinked: doc.isLinked, url: doc.url, notes: doc.notes, path : doc.path,
      });
    }
    else{
      return false;
    }

    if (Array.isArray(supportingDocsArray) && supportingDocsArray.length){
      return true;
    }
    else{
      return false;
    }
  }

  approveBid(bid: Bid){
    bid.isApproved = true;
    if (this.user && this.user.key != bid.bidCreatorKey){
      bid.bidChallengerKey = this.user.key;
      bid.bidCreatorChallengerKey = `${bid.bidCreatorKey}_${bid.bidChallengerKey}`;
    }
    else{
    }
    delete bid.declaredLoser;
    delete bid.declaredWinner;
    delete bid.verifiedWinner;
    delete bid.verifiedLoser;
    delete bid.winnerSupportingDocs;
    delete bid.loserSupportingDocs;

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

    firstValueFrom(
      this.userService.getAll()
    )
      .then((res) =>{
        if (Array.isArray(res)){
          let creator = res.find(user => user.key === (<Bid>this.bid).bidCreatorKey);
          if (creator){
            this.creatorName = <string>creator.fullName;
          }

          if ((<Bid>this.bid).hasResult && (<Bid>this.bid).declaredWinner){
            let declaredWinnerKey = (<Bid>this.bid).declaredWinner;
            let verifiedWinnerKey = (<Bid>this.bid).verifiedWinner;

            let actualUser = res.find(user => user.key === this.user?.key);
            if (actualUser && actualUser.isAdmin){
              this.isAdmin = true;
            }
            else{
              this.isAdmin = false;
            }

            let declaredWinner = res.find(user => user.key === declaredWinnerKey);
            let confirmedWinner = res.find(user => user.key === declaredWinnerKey);

            if (declaredWinner){
              this.unconfirmedWinnerFullName = <string>declaredWinner.fullName;
            }

            if (confirmedWinner){
              this.unconfirmedWinnerFullName = <string>confirmedWinner.fullName;
            }

          }

        }
      });
  }

  canConcedeDefeat(bid: Bid){
    return !bid.resultVerified && bid.isApproved && this.user 
      && this.user.key && 
      (this.user.key === bid.bidCreatorKey || this.user.key === bid.bidChallengerKey) && 
      ((this.user.key == bid.declaredLoser && !bid.resultVerified) || (!bid.hasResult));
  }

  canDeclareVictory(bid: Bid){
    if (!this.user){
      return false;
    }

    if (!bid.isApproved){
      return false;
    }

    if (bid.resultVerified){
      return false;
    }

    if (bid.hasResult){
      return false;
    }

    if (this.user && (this.user.key === bid.bidCreatorKey || this.user.key === bid.bidChallengerKey)){
      return true;
    }
    else{
      return false;
    }

  }

  canDisplayCounterOfferOrApprove(bid : Bid){
    if (!this.user){
      return false;
    }
    if (bid.isApproved){
      return false;
    }

    if (this.user && (this.user.key === bid.bidCreatorKey)){
      return false; // Don't show counter offers for the creator of the bid.
    }

    if (bid.rootBidKey === 'root'){
      return true;
    }
    else{
      return bid.bidChallengerKey === <string>this.user.key;
    }

      // OR, if it's not the root bid, but it's a bid whose challenger key is the users

  }

  adminChooseWinner(){
    const dialogRef = this.dialog.open(AdminChooseWinnerComponent, {
      width: '550px',
      position: {top: '200px'},
      data: {
       bid: this.bid,
      }
    });

    dialogRef.afterClosed().subscribe(selectedUser => {

      if (selectedUser){
        let declaredLoserKey = this.bid.bidCreatorKey != selectedUser.key ? this.bid.bidCreatorKey : this.bid.bidChallengerKey;

        this.bid.verifiedLoser = declaredLoserKey;
        this.bid.verifiedWinner = selectedUser.key;
        this.bid.verifiedDate = new Date();
        this.bid.resultVerified = true;
        this.bid.hasResult = true;
        this.bid.declaredWinner = selectedUser.key;
        this.bid.declaredLoser = declaredLoserKey;
    
        // Clone bid as base-level bid
        let newBid = JSON.parse(JSON.stringify(this.bid)) as Bid;
        newBid.rootBidKey = 'root';
        newBid.bids = [];
        newBid.parentPath = '/bids/';
        
        this.bidService.create(newBid)
          .then(() => {
            // Then remove orignal root and all of the root's child bilds
            let promise = null;
            if (this.bid.rootBidKey != 'root'){
              promise = this.bidService.delete('/bids/', <string>this.bid.rootBidKey);
            }
            else{
              promise = this.bidService.delete('/bids/', <string>this.bid.key);
            }
            promise
              .then(() => {
                this.accordionBaseCallback.emit();
              });
          });
      }
    });
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
    let declaredLoserKey = bid.bidCreatorKey != this.user?.key ? bid.bidCreatorKey : bid.bidChallengerKey;
    let declaredLoserName : string;
    firstValueFrom(
      this.userService.getAll()
    )
      .then((res) =>{
        if (Array.isArray(res)){
          let declaredLoserUser = res.find(user => user.key === declaredLoserKey);
          if (declaredLoserUser){
            declaredLoserName = <string>declaredLoserUser.fullName;
            const dialogRef = this.dialog.open(BidConfirmationDialogComponent, {
              width: '550px',
              height: '240px',
              position: {top: '200px'},
              data: {
               isYesNo: true,
               isOk: false,
               dialogText: `Are you sure you would like to declare victory? 
               Unless ${(declaredLoserName ? declaredLoserName : 'your competitor')} concedes, documented 
               evidence must be provided in order to verify that you\'re the winner. 
               If no evidence is provided by either party within 10 day, this bid will be cancelled.`,
              },
              panelClass: 'modal-class'
            });
            dialogRef.afterClosed().subscribe(result => {
              if (result){
                bid.hasResult = true;
                bid.resultVerified = false;
                bid.declaredWinner = this.user?.key;
                bid.declaredLoser = declaredLoserKey;
            
                this.bidService.update(<string>bid.key, bid)
                .then(() => {
                  this.bid = bid;
                  this.setFormControlInputs();
                })
                .catch((err) => console.log("error: "+ err));
              }
            });
          }
        }
      });
  }
  
  concedeDefeat(bid: Bid){
    const dialogRef = this.dialog.open(BidConfirmationDialogComponent, {
      width: '550px',
      height: '240px',
      position: {top: '200px'},
      data: {
       isYesNo: true,
       isOk: false,
       dialogText: 'Are you sure you would like to concede defeat? This operation cannot be reversed.',
      },
      panelClass: 'modal-class'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result){
        bid.hasResult = true;
        bid.resultVerified = true;
        bid.declaredWinner = bid.bidCreatorKey != this.user?.key ? bid.bidCreatorKey : bid.bidChallengerKey;
        bid.declaredLoser = this.user?.key;
        bid.verifiedLoser = this.user?.key;
        bid.verifiedWinner = bid.declaredWinner;
        bid.verifiedDate = new Date();

        // Clone bid as base-level bid
        let newBid = JSON.parse(JSON.stringify(bid)) as Bid;
        newBid.rootBidKey = 'root';
        newBid.bids = [];
        newBid.parentPath = '/bids/';
        
        this.bidService.create(newBid)
          .then(() => {
            // Then remove orignal root and all of the root's child bilds
            let promise = null;
            if (bid.rootBidKey != 'root'){
              promise = this.bidService.delete('/bids/', <string>bid.rootBidKey);
            }
            else{
              promise = this.bidService.delete('/bids/', <string>bid.key);
            }
            promise
              .then(() => {
                this.accordionBaseCallback.emit();
              });
          });
      }
    });

    // Update Win/Loss Status -- TODO
    // Distribute Funds -- TODO

    this.bidService.update(<string>bid.key, bid)
    .then(() => {
    })
    .catch((err) => console.log("error: "+ err))
  }

  refreshBase(){
    this.accordionBaseCallback.emit();
  }

  challengeResult(bid: Bid){
    const initialDialog = this.dialog.open(BidConfirmationDialogComponent, {
      width: '550px',
      height: '240px',
      position: {top: '200px'},
      data: {
       isYesNo: false,
       isOk: true,
       dialogText: 'Upload files as evidence to challenge result. The evidence will be compared and the winner will be announced within 15 days.',
      },
      panelClass: 'modal-class'
    });

    initialDialog.afterClosed().subscribe(result => {
      if (result){
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
    const initialDialog = this.dialog.open(BidConfirmationDialogComponent, {
      width: '550px',
      height: '240px',
      position: {top: '200px'},
      data: {
       isYesNo: false,
       isOk: true,
       dialogText: `Upload files to prove your victory. If your competitor 
       does not submit counter-evidence within 10 days, you will be declared as winner; otherwise,
       the evidence will be compared and the winner will be announced within 15 days.`,
      },
      panelClass: 'modal-class'
    });

    initialDialog.afterClosed().subscribe(result => {
      if (result){

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
    });
  }

  deleteBid(bid: Bid){
    const dialogRef = this.dialog.open(BidConfirmationDialogComponent, {
      width: '550px',
      height: '240px',
      position: {top: '200px'},
      data: {
       isYesNo: true,
       isOk: false,
       dialogText: `Are you sure you would like to delete bids? All counter offers will be removed.`,
      },
      panelClass: 'modal-class'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result){
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
        });
      }
    });
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