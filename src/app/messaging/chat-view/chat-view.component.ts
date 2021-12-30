import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { IM } from 'src/app/models/im';

@Component({
  selector: 'app-chat-view',
  templateUrl: './chat-view.component.html',
  styleUrls: ['./chat-view.component.less']
})
export class ChatViewComponent implements OnInit {
  @Input() imMessages !: IM[];

  constructor() { }

  ngOnInit(): void {
    console.log({"messagesInChatView":this.imMessages});
    this.setMessages(this.imMessages);
  }

  setMessages(messageList: IM[]){
    if (Array.isArray(messageList) && messageList.length){
      messageList.forEach((im) => {
        if(im.msgDateStr){
          let parsedDate = Date.parse(im.msgDateStr);
          let date = new Date(parsedDate);
          
          let monthAndDay = `${date.toLocaleString('default', { month: 'short' })} ${date.getDay()}`;
          im.msgDateStr = monthAndDay;

          im.time = date.toLocaleTimeString(navigator.language, {hour: '2-digit', minute:'2-digit'});
        }

      });
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    for (const propName in changes) {
      if (changes.hasOwnProperty(propName)) {
        console.log("propName: " + propName);
        let change = changes[propName];
        console.log({"change":change})
        switch (propName) {
          case 'imMessages': {
            this.setMessages(change.currentValue)
          }
          break;
        }
      }
    }
  }

}
