import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Bid } from '../models/bid';

type ModalInput = {isYesNo: boolean; isOk: boolean, dialogText: string,} 


@Component({
  selector: 'app-bid-confirmation-dialog',
  templateUrl: './bid-confirmation-dialog.component.html',
  styleUrls: ['./bid-confirmation-dialog.component.less']
})
export class BidConfirmationDialogComponent implements OnInit {
  isYesNo !:boolean;
  isOk !:boolean;
  dialogText !: string;


  constructor(
    public dialogRef: MatDialogRef<BidConfirmationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ModalInput,
  ) { }

  ngOnInit(): void {
    this.isOk = this.data.isOk;
    this.isYesNo = this.data.isYesNo;
    this.dialogText = this.data.dialogText;
  }
  closeModal(){
    this.dialogRef.close(false);
  }
  confirm(){
    this.dialogRef.close(true);
  }
}
