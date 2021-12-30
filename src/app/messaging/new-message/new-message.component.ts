import { Component, OnInit, EventEmitter, Output, ChangeDetectorRef } from '@angular/core';
import { IM } from 'src/app/models/im';
import { User } from 'src/app/models/user';
import { AuthService } from 'src/app/services/auth.service';
import { MessageService } from 'src/app/services/message.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-new-message',
  templateUrl: './new-message.component.html',
  styleUrls: ['./new-message.component.less']
})
export class NewMessageComponent implements OnInit {
  @Output() closeNewMsgCallback : EventEmitter<any> = new EventEmitter();
  expanded: boolean = true;
  userSearchStr !: null;
  selectedMessageUser !: User | null;
  msgText !: null;
  conversationMessageList !: IM[];

  constructor(
    private  messageService: MessageService,
    private authService: AuthService,
    private changeDetectRef: ChangeDetectorRef,
    private userService: UserService,
  ) { 
  }

  ngOnInit(): void {
  }
  closeNewMsgt(){
    console.log("closing new message")
    this.closeNewMsgCallback.emit();
  }

  removeSelectedUser(){
    this.selectedMessageUser = null;
    this.conversationMessageList = [];
  }

  userSelected(selectedUser: User){

    this.selectedMessageUser = selectedUser;
    this.userSearchStr = null;
    this.messageService.getMessagesBetweenUsers(<string>this.authService.getAccount()?.key, <string>selectedUser.key)
      .subscribe({
        next: ((res) => {
          if (Array.isArray(res) && res.length){
            this.conversationMessageList = res;
            this.changeDetectRef.detectChanges();
          }
          else{
            this.conversationMessageList = [];
            this.changeDetectRef.detectChanges();
          }
        }),
        error: ((err) => {
          console.log("error" + err)
        }),
        complete: () => {
          console.log("completed!!")
        },
      });
        
  }

  sendMessage(){

    let fromAuthUser = this.authService.getAccount();
    let toUser = this.selectedMessageUser;
    this.userService.getSingle(<string>fromAuthUser?.key)
      .then((user) => {
        let fromUser = user;
        this.messageService.create(
          {
            fromUser : fromUser?.key,
            toUser : toUser?.key,
            fromToPair : `${fromUser?.key}_${toUser?.key}`,
            msgDateStr : new Date().toISOString(),
            msgText : this.msgText ? this.msgText : '',
            fromUserFullName : `${fromUser?.firstName} ${fromUser.lastName}`,
            toUserFullName : `${(toUser ? toUser?.firstName : '')} ${(toUser ? toUser.lastName : '')}`,
            fromUserImgSrc : fromUser.profilePicSrc,
            toUserImgSrc : toUser?.profilePicSrc,
          }
        );
      })
        .finally(() => {
          this.msgText = null;
          
        });
  }

  stopPropagation(event: any){
    event.stopPropagation();
  }

  expandCollapse(){
    this.expanded = !this.expanded;

  }

}
