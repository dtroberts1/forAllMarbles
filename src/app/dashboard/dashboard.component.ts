import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { FeedComponent } from '../feed/feed.component';
import { IM } from '../models/im';
import { AuthUser, User } from '../models/user';
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
  @ViewChild('searchinput') searchInput !: ElementRef;

  canDispNewMessageScrn :boolean = false;
  existingMessage !: IM;
  selectedUser !: User | null;
  searchText !: string;
  canDispVis !: boolean;

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

  openMessageThread(user: User){
    this.selectedUser = user;
    this.canDispNewMessageScrn = true;
  }

  openCreateNewMsg(){
    this.canDispNewMessageScrn = true;
  }

  closeNewMessage(){
    this.canDispNewMessageScrn = false;
    this.selectedUser = null;
  }

  ngOnInit(): void {
    this.authUser = this.authService.getAccount();
    if (!this.authUser){
      this.router.navigate(['/login']);
    }
   
  }

  toggleSearchVis(){
    this.canDispVis = !this.canDispVis;
    if (this.canDispVis){
      this.searchInput.nativeElement.focus();
    }
  }

  logout(){
    this.authService.SignOut()
      .then((res) => {
        this.router.navigate(['/login']);
      });
  }

}
