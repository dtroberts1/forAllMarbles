import { Component, ElementRef, EventEmitter, Input, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Preferences } from '../interfaces/preferences';
import { StatusNotification } from '../models/status-notification';
import { AuthUser } from '../models/user';
import { PreferencesComponent } from '../preferences/preferences.component';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notifications.service';
import { UserService } from '../services/user.service';
import {HostBinding} from '@angular/core';
import {OverlayContainer} from "@angular/cdk/overlay";
const THEME_DARKNESS_SUFFIX = `-dark`;

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent implements OnInit {
  @HostBinding('class') activeThemeCssClass: string | undefined;
  activeTheme: string | undefined;
  selectedFooterItem = '';
  profCardLocked :boolean = false;
  notificationCardLocked :boolean = false;
  @Input() authUser!: AuthUser | null;
  @ViewChild('profileCard') profileCard !: ElementRef;
  @ViewChild('notifications') notifications !: ElementRef;
  @Input() notificationList !: StatusNotification[];
  @Input() isThemeDark !: boolean;
  //Input() pref !: Preferences;
  @Input() preferences !: Preferences;
  @Output() preferencesChanged = new EventEmitter();
  cssClasses !: string[];

  canSeeAllNotifs : boolean = false;
  notificationUnreadCount : number = 0;
  constructor(
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService,
    public dialog: MatDialog,
    private userService: UserService,
    private overlayContainer: OverlayContainer,
  ) { 
//    this.setTheme('purple-green', true); // Default theme

  }

  ngOnInit(): void {
  }

  setTheme(theme: string, darkness: boolean | null = null) {
    if (darkness === null)
        darkness = this.isThemeDark;
    else if (this.isThemeDark === darkness) {
        if (this.activeTheme === theme) return;
    } else
        this.isThemeDark = darkness;

    this.activeTheme = theme;

    const cssClass = darkness === true ? theme + THEME_DARKNESS_SUFFIX : theme;

    const classList = this.overlayContainer.getContainerElement().classList;
    if (classList.contains(<string>this.activeThemeCssClass))
        classList.replace(<string>this.activeThemeCssClass, cssClass);
    else
        classList.add(cssClass);

    this.activeThemeCssClass = cssClass;
}

  openPreferences(event: any){

    let origPref = this.preferences;
    this.cssClasses = ['modal-class'];
    this.cssClasses.push(this.isThemeDark ? 'dark-theme': 'light-theme');

    const dialogRef = this.dialog.open(PreferencesComponent, {
      width: '550px',
      height: '640px',
      data: {
        preferences: this.preferences,
      },
      panelClass: this.cssClasses,
    });

    dialogRef.componentInstance.preferencesChanged.subscribe(
      pref => {
        this.preferences = pref;
        this.cssClasses[0] = 'modal-class';
        //this.cssClasses[1] = (this.preferences.nightMode ? 'dark-theme': 'light-theme');
        setTimeout(() => {
          dialogRef.removePanelClass('dark-theme');
          dialogRef.removePanelClass('light-theme');

            dialogRef.addPanelClass(this.preferences.nightMode ? 'dark-theme': 'light-theme');

        }, 100);
        this.preferencesChanged.emit(this.preferences);

      }
    )

    dialogRef.afterClosed().subscribe(result => {
      if (result){
        this.preferences = {
          backgroundUrl : result.backgroundUrl,
          backgroundSize : result.backgroundSize,
          backgroundPosition : result.backgroundPosition,
          opacity: result.opacity,
          nightMode : result.nightMode,
        };
        this.preferencesChanged.emit({preferences: this.preferences});

        if (this.authUser){
          this.userService.getSingle(<string>this.authUser?.key)
          .then((user) => {
              user.backgroundUrlPreference = this.preferences.backgroundUrl;
              user.backgroundSizePreference = this.preferences.backgroundSize;
              user.backgroundPositionPreference = this.preferences.backgroundPosition;
              user.opacity = this.preferences.opacity;
              user.nightMode = this.preferences.nightMode;
              this.userService.update(
                <string>this.authUser?.key, user,
              );
          });
        }
      }
      else{
        this.preferences = origPref;
        this.preferencesChanged.emit({preferences: this.preferences});

      }
    });
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
