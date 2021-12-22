import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-create-new-bid',
  templateUrl: './create-new-bid.component.html',
  styleUrls: ['./create-new-bid.component.less']
})
export class CreateNewBidComponent implements OnInit {
  isEditInstructionsMode: boolean = false;
  betText!: string;

  constructor() { }

  ngOnInit(): void {
  }
  editInstructions(){
    this.isEditInstructionsMode = true;
  }

  saveInstructions(){
      this.isEditInstructionsMode = false;
  }
}
