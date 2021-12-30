import { Component, OnInit, Output, EventEmitter} from '@angular/core';
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
          console.log({"users":users});
          // Get The most recent message for each user that the logged-in user has contacted
          if (Array.isArray(users)){
            users.forEach((user) => {
              this.messageService.getMessagesBetweenUsers(<string>this.authService.getAccount()?.key, <string>user.key)
                .subscribe((messages) => {
                  if (Array.isArray(messages) && messages.length){
                    let message = messages[messages.length - 1];
                    this.previews.push(
                      {
                        user: user, 
                        contents: message.msgText ? message.msgText : '',
                        dateStr: message.msgDateStrFormatted ? message.msgDateStrFormatted : '',
                      });
                  }
                })
            })
          }
        }

      );
  }
  expandCollapseConvoList(){
    this.convoListExpanded = !this.convoListExpanded;
  }

  userContactSelected(userFullNameStr: any){

    console.log("selected user is " + userFullNameStr);
  }

  openNewMessagePopup(event: any){
    event.stopPropagation();
    this.createNewMsgtCallback.emit();
  }

  stopPropagation(event: any){
    event.stopPropagation();
  }

}
