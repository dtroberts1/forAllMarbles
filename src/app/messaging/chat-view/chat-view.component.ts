import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { UniqueDay } from 'src/app/interfaces/unique-day';
import { IM } from 'src/app/models/im';

@Component({
  selector: 'app-chat-view',
  templateUrl: './chat-view.component.html',
  styleUrls: ['./chat-view.component.less']
})
export class ChatViewComponent implements OnInit {
  @Input() imMessagesGrouped !: UniqueDay[];

  constructor() { }

  ngOnInit(): void {
    this.setMessages(this.imMessagesGrouped);
  }

  setMessages(messageListGroup: UniqueDay[]){
    messageListGroup.forEach((uniqueDay : UniqueDay) => {
      if (Array.isArray(uniqueDay.imList) && uniqueDay.imList.length){
        uniqueDay.imList.forEach((im) => {
          if(im.msgDateStr){
            let parsedDate = Date.parse(im.msgDateStr);
            let date = new Date(parsedDate);
            
            let monthAndDay = `${date.toLocaleString('default', { month: 'short' })} ${date.getDay()}`;
            im.msgDateStrFormatted = monthAndDay;
  
            im.timeFormatted = date.toLocaleTimeString(navigator.language, {hour: '2-digit', minute:'2-digit'});
          }
  
        });
      }
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    for (const propName in changes) {
      if (changes.hasOwnProperty(propName)) {
        let change = changes[propName];
        switch (propName) {
          case 'imMessagesGrouped': {
            this.setMessages(change.currentValue)
          }
          break;
        }
      }
    }
  }

}
