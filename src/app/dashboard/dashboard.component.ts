import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { FeedComponent } from '../feed/feed.component';
import { IM } from '../models/im';
import { StatusNotification } from '../models/status-notification';
import { AuthUser, User } from '../models/user';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notifications.service';
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
  notificationList !: StatusNotification[];

  canDispNewMessageScrn :boolean = false;
  existingMessage !: IM;
  selectedUser !: User | null;
  searchText !: string;
  canDispVis !: boolean;

  constructor(
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService,

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
    this.notificationList = []

    this.authUser = this.authService.getAccount();
    if (!this.authUser){
      this.router.navigate(['/login']);
    }
    this.getNotifications();

  }

  getNotifications(){
    
    if (this.authUser){

      this.notificationService.getNotificationsForUser(<string>this.authUser?.key)
        .subscribe(
          res => {
            this.notificationList = []

            if (Array.isArray(res)){
              res.forEach(itm => {

                let notifDateMS = new Date(<string>itm.notificationDateStr).getTime();
                let nowMS = new Date().getTime();
                let minutes = (nowMS - notifDateMS) / 1000 / 60;

                let val = null;
                let type = null;
                
                if (minutes < 60){
                  val = minutes;
                  type = "minutes";
                }
                else if (minutes < (60 * 24)){
                  val = minutes / 60;
                  type = "hours";
                }
                else if (minutes < (60 * 24 * 7)){
                  val = minutes / 60 / 24;
                  type = "days";
                }
                else {
                  val = minutes / 60 / 24 / 7;
                  type = "weeks";
                }

                val = Math.round(val);

                itm.recencyString = `${val} ${type} ago`;

              });
              
              this.notificationList = res;
            }
            if (!res || !Array.isArray(res) || !res.length){
            }
          }
        );
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
