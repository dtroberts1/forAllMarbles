import { Component, ElementRef, Input, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { UniqueDay } from 'src/app/interfaces/unique-day';
import { IM } from 'src/app/models/im';
import { AuthUser } from 'src/app/models/user';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-chat-view',
  templateUrl: './chat-view.component.html',
  styleUrls: ['./chat-view.component.less']
})
export class ChatViewComponent implements OnInit {
  @Input() imMessagesGrouped !: UniqueDay[];
  notificationSound !: HTMLAudioElement;
  currUser !: AuthUser | null;
  @ViewChild('scrollMe') scrollMe !: ElementRef;
  hasUnreadMessages : boolean = false;
  scrollTop !: number;

  constructor(
    private authService: AuthService,

  ) { }

  ngOnInit(): void {
    this.currUser = this.authService.getAccount();
    this.setMessages(this.imMessagesGrouped);
    this.notificationSound = new Audio();
    this.notificationSound.src = `../../../assets/audio/notification_sound.mp3`;
    this.notificationSound.load();
  }

  setMessages(messageListGroup: UniqueDay[]){
    messageListGroup.forEach((uniqueDay : UniqueDay) => {
      if (Array.isArray(uniqueDay.imList) && uniqueDay.imList.length){
        uniqueDay.imList.forEach((im) => {
          if(im.msgDateStr){
            let parsedDate = Date.parse(im.msgDateStr);
            let date = new Date(parsedDate);
            console.log("day is " + date.getDate())
            let monthAndDay = `${date.toLocaleString('default', { month: 'short' })} ${date.getDate()}`;
            im.msgDateStrFormatted = monthAndDay;
  
            im.timeFormatted = date.toLocaleTimeString(navigator.language, {hour: '2-digit', minute:'2-digit'});
          }
        });
      }
    });
    console.log({"messageListGroup":messageListGroup})
  }

  getCountChanged(origGroup : UniqueDay[], newGroup : UniqueDay[] ){
    if (!origGroup){
      return false;
    }
    let list1 = origGroup.map(a => a.imList);
    let list2 = newGroup.map(a => a.imList);
    if (Array.isArray(list1) && list1.length && Array.isArray(list2) && list2.length){
      return list1.reduce((a, b) => a.concat(b)).length < 
      list2.reduce((a, b) => a.concat(b)).length;
    }
    else{
      return false;
    }
  }

  onScroll(event: any){
    //console.log({"event":event})
    if ((window.innerHeight + window.scrollY) >= document.body.scrollHeight) {
      // you're at the bottom of the page
      console.log("Bottom of page");

    }

    console.log({"this.scrollMe":this.scrollMe})

    if (this.scrollMe && this.scrollMe.nativeElement){
      this.scrollTop = this.scrollMe.nativeElement.scrollTop;
  
      if ((this.scrollMe.nativeElement.scrollTop  + this.scrollMe.nativeElement.clientHeight) >= (this.scrollMe.nativeElement.scrollHeight - 2)){
        console.log("scrolled to bottom!!");
        this.hasUnreadMessages = false;
      }
      
    }
  }


  ngOnChanges(changes: SimpleChanges) {
    for (const propName in changes) {
      if (changes.hasOwnProperty(propName)) {
        let change = changes[propName];
        switch (propName) {
          case 'imMessagesGrouped': {
            if (this.currUser && (<UniqueDay[]>change.currentValue)[change.currentValue.length -1]
            .imList[(<UniqueDay[]>change.currentValue)[change.currentValue.length -1].imList.length -1].fromUser != this.currUser.key
            && this.getCountChanged(change.previousValue, change.currentValue)){
              this.notificationSound.play();
              this.hasUnreadMessages = true;
            }
            this.setMessages(change.currentValue)
          }
          break;
        }
      }
    }
  }

}
