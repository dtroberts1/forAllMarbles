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
    this.notificationList = []
  }

  getNotifications(){
    
    if (this.authUser){

      this.notificationService.getNotificationsForUser(<string>this.authUser?.key)
        .subscribe(
          res => {
            this.notificationList = []

            if (Array.isArray(res)){
              this.notificationList = res;
              this.notificationUnreadCount = this.notificationList.filter(notif => !notif.isRead)?.length;
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

  openNotificationMenu(){
    this.selectedFooterItem = 'notifications';
    setTimeout(() => {
      if (this.notifications){
        this.notifications.nativeElement.focus();
      }
    }, 0);
  }

  blurCard(event : any){

    setTimeout(() => {
      this.selectedFooterItem = null as any;
      this.profCardLocked = false;
  
    }, 150)

  }
  
  ngOnChanges(changes: SimpleChanges) {
    for (const propName in changes) {
      if (changes.hasOwnProperty(propName)) {
        let change = changes[propName];
        switch (propName) {
          case 'notificationList': {
            this.notificationList = []

            if (Array.isArray(change.currentValue)){
              this.notificationList = change.currentValue;
              this.notificationUnreadCount = this.notificationList.filter(notif => !notif.isRead)?.length;

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

  logout(event: any){
    event.stopPropagation();
    this.authService.SignOut()
      .then((res) => {
        this.router.navigate(['/login']);
      });
    }
}
