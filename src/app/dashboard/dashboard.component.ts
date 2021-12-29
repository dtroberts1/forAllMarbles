import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FeedComponent } from '../feed/feed.component';
import { AuthUser } from '../models/user';
import { AuthService } from '../services/auth.service';
import { YourBidsComponent } from '../your-bids/your-bids.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.less']
})
export class DashboardComponent implements OnInit {
  authUser !:AuthUser | null;
  @ViewChild(FeedComponent) feed !: FeedComponent;
  @ViewChild(YourBidsComponent) yourBids !: YourBidsComponent;
  canDispNewMessageScrn :boolean = false;


  constructor(
    private authService: AuthService,
    private router: Router,
  ) { }

  notifyChild(event: any){
    let index = event.index;
    switch(index){
      case 0:
        this.feed.accordionCallback();
        break;
      case 1:
        this.yourBids.accordionCallback();
        break; 
    }
  }

  openCreateNewMsg(){
    this.canDispNewMessageScrn = true;
  }

  closeNewMessage(){
    console.log("callback received")
    this.canDispNewMessageScrn = false;
  }

  ngOnInit(): void {
    this.authUser = this.authService.getAccount();
    if (!this.authUser){
      this.router.navigate(['/login']);
    }
   
  }

  logout(){
    this.authService.SignOut()
      .then((res) => {
        this.router.navigate(['/login']);
      });
  }

}
