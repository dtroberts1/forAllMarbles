import { Component, OnInit, Type } from '@angular/core';
import { Bid } from '../models/bid';
import { AuthUser } from '../models/user';
import { AuthService } from '../services/auth.service';
import { BidService } from '../services/bid.service';

type BidNameWithAmt = {bidName: string, bidAmount: number};

@Component({
  selector: 'app-earnings-losses',
  templateUrl: './earnings-losses.component.html',
  styleUrls: ['./earnings-losses.component.less']
})
export class EarningsLossesComponent implements OnInit {
  data !:BidNameWithAmt[];
  authUser !:AuthUser | null;

  constructor(
    private bidService: BidService,
    private authService: AuthService,
  ) { }

  ngOnInit(): void {
    this.authUser = this.authService.getAccount();

    if (this.authUser){
      this.bidService.getAll()
      .subscribe( 
        (
          (bids: Bid[]) => {
          if (Array.isArray(bids)){
            // Only apply updates to the root if the count has changed.
            if (this.authUser){
              
              this.data = bids
                .filter(bid => bid.bidCreatorChallengerKey?.includes(<string>this.authUser?.key) && bid.resultVerified && (bid.verifiedLoser == (<AuthUser>this.authUser)?.key || 
                  bid.verifiedWinner == (<AuthUser>this.authUser)?.key)).slice(0, 10)
                .map((bid) => <BidNameWithAmt>{
                  bidName: bid.title,
                  bidAmount: bid.verifiedLoser == ((<AuthUser>this.authUser)?.key) ? 
                    -1 * <number>bid.bidAmount :
                    <number>bid.bidAmount
                });
              
            }
          }
          else{
            this.data = [];
          }
        }
      ));
    }
  }

}
