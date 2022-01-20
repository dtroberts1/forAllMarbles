import { Component, ElementRef, Input, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { StatusNotification } from '../models/status-notification';
import { AuthUser } from '../models/user';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notifications.service';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.less']
})
export class ToolbarComponent implements OnInit {
  selectedFooterItem = '';
  profCardLocked :boolean = false;
  notificationCardLocked :boolean = false;
  @Input() authUser!: AuthUser | null;
  @ViewChild('profileCard') profileCard !: ElementRef;
  @ViewChild('notifications') notifications !: ElementRef;
  @Input() notificationList !: StatusNotification[];
  canSeeAllNotifs : boolean = false;
  notificationUnreadCount : number = 0;
  constructor(
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService,
  ) { }

  ngOnInit(): void {
  }

  getNotifications(){
    if (this.authUser){

      this.notificationService.getNotificationsForUser(<string>this.authUser?.key)
        .subscribe(
          res => {
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

                val = Math.round(val).toString();

                itm.recencyString = `${val} ${type} ago`;

              });
              this.notificationList = res;
              this.notificationUnreadCount = this.notificationList.filter(notif => !notif.isRead)?.length;
                          }
            else{
              this.notificationList = []
            }
            if (!res || !Array.isArray(res) || !res.length){
              this.selectedFooterItem = null as any;
            }
          }
        );
    } 
  }

  markNotificationAsRead(notification: StatusNotification){
    if (notification.key){
      this.notificationService.markNotificationAsRead(notification)
        .then(() => {
          this.getNotifications();

        });
    }
  }

  deleteNotification(notification: StatusNotification){
    if (notification.key){
      this.notificationService.deleteNotification(notification.key)
        .then(() => {
          this.getNotifications();

        });
    }
  }

  openProfileContext(){
    this.selectedFooterItem = 'profile';
    setTimeout(() => {
      if (this.profileCard){
        this.profileCard.nativeElement.focus();
      }
    }, 0);
  }
  lockProfileCard(event : any){

    this.profCardLocked = true;
  }

  lockNotificationCard(event: any){
    this.notificationCardLocked = true;
  }

  openNotificationMenu(){
    this.selectedFooterItem = 'notifications';
    setTimeout(() => {
      if (this.notifications){
        this.notifications.nativeElement.focus();
      }
    }, 0);
  }

  blurCard(event : any){

    if (event.relatedTarget && event.relatedTarget.id === 'profile-dropdown-icon' && this.selectedFooterItem === 'notifications'){
      return;
    }

    if (event.relatedTarget && event.relatedTarget.id === 'notif-bell-mat-icon' && this.selectedFooterItem === 'profile'){
      return;
    }

    if (event.relatedTarget && event.relatedTarget.id === 'notif-collapser'){
      return;
    }

    setTimeout(() => {
      this.selectedFooterItem = null as any;
      this.profCardLocked = false;
      this.notificationCardLocked = false;
    }, 150);
  }
  
  ngOnChanges(changes: SimpleChanges) {
    for (const propName in changes) {
      if (changes.hasOwnProperty(propName)) {
        let change = changes[propName];
        switch (propName) {
          case 'notificationList': {

            if (Array.isArray(change.currentValue)){
              this.notificationList = change.currentValue;
              this.notificationUnreadCount = this.notificationList.filter(notif => !notif.isRead)?.length;

            }
            else{
              this.notificationList = []
            }
            if (!change.currentValue || !Array.isArray(change.currentValue) || !change.currentValue.length){
              this.selectedFooterItem = null as any;
            }
          }
          break;
        }
      }
    }
  }

  toggleCollapse(event: any){
    this.canSeeAllNotifs = !this.canSeeAllNotifs;
  }

  logout(event: any){
    event.stopPropagation();
    this.authService.SignOut()
      .then((res) => {
        this.router.navigate(['/login']);
      });
    }
}
