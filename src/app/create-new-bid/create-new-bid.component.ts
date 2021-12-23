import { Component, OnInit } from '@angular/core';
import { User } from '../models/user';
import { AuthService } from '../services/auth.service';
import { BidService } from '../services/bid.service';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-create-new-bid',
  templateUrl: './create-new-bid.component.html',
  styleUrls: ['./create-new-bid.component.less']
})
export class CreateNewBidComponent implements OnInit {
  isEditInstructionsMode: boolean = false;
  betText!: string;
  bidAmt!: number;

  constructor(
    private bidService: BidService,
    private userService: UserService,
    private authService: AuthService,
  ) { }

  ngOnInit(): void {
  }
  editInstructions(){
    this.isEditInstructionsMode = true;
  }

  createBid(){
    let key = this.authService.getAccount()?.key;
    if (key){
      this.userService.getSingle(key)
        .then((user : User) => {
          this.bidService.create(
            {
              bidAmount : this.bidAmt,
              bidCreatorKey : user.key,
              bidMessage : this.betText,
              bidCreatorChallengerKey: user.key,
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
              this.betText = null as any;
            });
        });
    }
  }

  saveInstructions(){
      this.isEditInstructionsMode = false;
  }
}
