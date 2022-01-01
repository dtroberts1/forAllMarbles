import { Component, OnInit, Output, EventEmitter} from '@angular/core';
import { IM } from '../models/im';
import { User } from '../models/user';
import { AuthService } from '../services/auth.service';
import { MessageService } from '../services/message.service';
import { UserService } from '../services/user.service';

type MessagePrev = {user: User, contents: string, dateStr: string};

@Component({
  selector: 'app-messaging',
  templateUrl: './messaging.component.html',
  styleUrls: ['./messaging.component.less']
})
export class MessagingComponent implements OnInit {
  convoListExpanded: boolean = false;
  @Output() createNewMsgtCallback : EventEmitter<any> = new EventEmitter();
  @Output() openMsgThreadCallback : EventEmitter<any> = new EventEmitter();
  availUsers!: User[];
  previews: MessagePrev[] = [];

  constructor(
    private userService: UserService,
    private messageService: MessageService,
    private authService: AuthService,
  ) { }

  ngOnInit(): void {
    this.userService.getAll()
      .subscribe(
        users => {
          // Get The most recent message for each user that the logged-in user has contacted
          if (Array.isArray(users)){
            users.forEach((user) => {
              let thisUsersKey = <string>this.authService.getAccount()?.key;
              this.messageService.getMessagesBetweenUsers(thisUsersKey, <string>user.key)
                .subscribe((messages) => {
                  if (Array.isArray(messages) && messages.length){

                    if (!this.previews.map(prev => prev.user.key).some(key => key == thisUsersKey || key == <string>user.key)){
                      // If previews doesn't yet contain a preview whose key matches either user, add preview
                      let message = messages[messages.length - 1];
                      let parsedDate = Date.parse(message.msgDateStr ? message.msgDateStr : '');
                      let date = new Date(parsedDate);
  
                      this.previews.push(
                        {
                          user: user, 
                          contents: message.msgText ? message.msgText : '',
                          dateStr: `${date.toLocaleString('default', { month: 'short' })} ${date.getDate()}`,
                        });
                    }
                  }
                })
            })
          }
        }

      );
  }

  openMessageThread(event: any, user: User){
    event.stopPropagation();
    this.openMsgThreadCallback.emit(user);

  }
  expandCollapseConvoList(){
    this.convoListExpanded = !this.convoListExpanded;
  }

  userContactSelected(userFullNameStr: any){
  }

  openNewMessagePopup(event: any){
    event.stopPropagation();
    this.createNewMsgtCallback.emit();
  }

  stopPropagation(event: any){
    event.stopPropagation();
  }

}
