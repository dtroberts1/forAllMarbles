import { Component, ElementRef, HostBinding, Inject, Input, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { FeedComponent } from '../feed/feed.component';
import { Preferences } from '../interfaces/preferences';
import { IM } from '../models/im';
import { StatusNotification } from '../models/status-notification';
import { AuthUser, User } from '../models/user';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notifications.service';
import { UserService } from '../services/user.service';
import { YourBidsComponent } from '../your-bids/your-bids.component';
import {OverlayContainer} from "@angular/cdk/overlay";
import { BehaviorSubject } from 'rxjs';

const THEME_DARKNESS_SUFFIX = `-dark`;
export interface Color {
  name: string;
  hex: string;
  darkContrast: boolean;
}

declare var require: any;
var tinycolor = require("tinycolor2");
var color = tinycolor("red");

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.less']
})
export class DashboardComponent implements OnInit {
  @HostBinding('class') activeThemeCssClass: string | undefined;
  authUser !:AuthUser | null;
  @ViewChild(FeedComponent) feed !: FeedComponent;
  @ViewChild(YourBidsComponent) yourBids !: YourBidsComponent;
  @ViewChild('searchinput') searchInput !: ElementRef;
  notificationList !: StatusNotification[];
  activeTheme: string | undefined;
  backgroundSrc !: string | undefined;
  backgroundSize : string | undefined;
  canDispNewMessageScrn :boolean = false;
  existingMessage !: IM;
  selectedUser !: User | null;
  searchText !: string;
  canDispVis !: boolean;
  backgroundPosition !: string | undefined;
  opacity !: number | undefined;
  preferences !: Preferences;
  isThemeDark !: boolean;
  primaryColor : string = '#8A2BE2';//'#DA3E3E';
  accentColor : string = '#6DFCD9';
  primaryColorPalette: Color[] = [];
  accentColorPalette: Color[] = [];

  constructor(
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService,
    private userService: UserService,
    private overlayContainer: OverlayContainer,

  ) {
    this.savePrimaryColor();
    this.saveAccentColor();
   }

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

  
  savePrimaryColor() {
    this.primaryColorPalette = this.computeColors(this.primaryColor);
    this.updateTheme(this.primaryColorPalette, 'primary');
  }

  saveAccentColor() {
    this.accentColorPalette = this.computeColors(this.accentColor);
    this.updateTheme(this.accentColorPalette, 'accent');
  }

  updateTheme(colors: Color[], theme: string) {
    colors.forEach(color => {
        document.documentElement.style.setProperty(
          `--theme-${theme}-${color.name}`,
          color.hex
        );
        document.documentElement.style.setProperty(
          `--theme-${theme}-contrast-${color.name}`,
          color.darkContrast ? 'rgba(black, 0.87)' : 'white'
        );
      });
  }
  
  computeColors(hex: string): Color[] {
    return [
      this.getColorObject(tinycolor(hex).lighten(52), '50'),
      this.getColorObject(tinycolor(hex).lighten(37), '100'),
      this.getColorObject(tinycolor(hex).lighten(26), '200'),
      this.getColorObject(tinycolor(hex).lighten(12), '300'),
      this.getColorObject(tinycolor(hex).lighten(6), '400'),
      this.getColorObject(tinycolor(hex), '500'),
      this.getColorObject(tinycolor(hex).darken(6), '600'),
      this.getColorObject(tinycolor(hex).darken(12), '700'),
      this.getColorObject(tinycolor(hex).darken(18), '800'),
      this.getColorObject(tinycolor(hex).darken(24), '900'),
      this.getColorObject(tinycolor(hex).lighten(50).saturate(30), 'A100'),
      this.getColorObject(tinycolor(hex).lighten(30).saturate(30), 'A200'),
      this.getColorObject(tinycolor(hex).lighten(10).saturate(15), 'A400'),
      this.getColorObject(tinycolor(hex).lighten(5).saturate(5), 'A700')
    ];
  }
  
  getColorObject(value : any, name : any): Color {
    const c = tinycolor(value);
    return {
      name: name,
      hex: c.toHexString(),
      darkContrast: c.isLight()
    };
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
    if (this.authUser){
      this.userService.getSingle(<string>this.authUser?.key)
        .then((user) => {
          this.preferences = {
            backgroundUrl : user.backgroundUrlPreference,
            backgroundPosition : user.backgroundPositionPreference,
            backgroundSize : user.backgroundSizePreference,
            opacity: user.opacity,
            nightMode : user.nightMode,
            primaryColor : user.primaryColor,
            accentColor: user.accentColor,
          }

          this.backgroundSrc = this.preferences.backgroundUrl;
          this.opacity = this.preferences.opacity;
          this.backgroundPosition = this.preferences.backgroundPosition;
          this.backgroundSize = this.preferences.backgroundSize;
          this.primaryColor = this.preferences.primaryColor ? this.preferences.primaryColor : '#DA3E3E';
          this.accentColor = this.preferences.accentColor ? this.preferences.accentColor : '#6DFCD9';

          this.updateThemePalette();
          this.setTheme('standard', this.preferences.nightMode); // Default theme

        })

    }

    if (!this.authUser){
      this.router.navigate(['/login']);
    }
    this.getNotifications();

  }

  updateThemePalette(){
    this.primaryColorPalette = this.computeColors(this.primaryColor);
    this.accentColorPalette = this.computeColors(this.accentColor);
    this.updateTheme(this.primaryColorPalette, 'primary');
    this.updateTheme(this.accentColorPalette, 'accent');
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

  preferencesChanged(event : any){
    this.backgroundSrc = (<Preferences>event.preferences).backgroundUrl;
    this.backgroundSize = (<Preferences>event.preferences).backgroundSize;
    this.backgroundPosition = (<Preferences>event.preferences).backgroundPosition;
    this.opacity = (<Preferences>event.preferences).opacity;
    this.primaryColor = <string>((<Preferences>event.preferences).primaryColor ?(<Preferences>event.preferences).primaryColor : this.primaryColor);
    this.accentColor = <string>((<Preferences>event.preferences).accentColor ? (<Preferences>event.preferences).accentColor : this.accentColor);
    let isNightMode= <boolean>(<Preferences>event.preferences).nightMode;
    this.preferences = {
      backgroundUrl : this.backgroundSrc,
      backgroundSize : this.backgroundSize,
      backgroundPosition : this.backgroundPosition,
      opacity : this.opacity,
      nightMode : isNightMode,
      primaryColor : this.primaryColor,
      accentColor: this.accentColor,
    }

    this.updateThemePalette();


    setTimeout(() => {
      this.setTheme('standard', isNightMode); // Default theme

    },100)

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
