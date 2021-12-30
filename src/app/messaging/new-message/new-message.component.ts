import { Component, OnInit, EventEmitter, Output, ChangeDetectorRef, Input, SimpleChanges } from '@angular/core';
import { dateInputsHaveChanged } from '@angular/material/datepicker/datepicker-input-base';
import { UniqueDay } from 'src/app/interfaces/unique-day';
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
  @Input() selectedUser !: User | null;

  expanded: boolean = true;
  userSearchStr !: null;
  selectedMessageUser !: User | null;
  msgText !: null;
  conversationMessageListGroup !: IM[][];
  conversationMessageList !: IM[];
  messageListGrouped : UniqueDay[] = [];
  isExistingThread : boolean = false;

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
    this.closeNewMsgCallback.emit();
  }

  removeSelectedUser(){
    this.selectedMessageUser = null;
    this.conversationMessageList = [];
    this.messageListGrouped = [];
  }

  ngOnChanges(changes: SimpleChanges) {
    for (const propName in changes) {
      if (changes.hasOwnProperty(propName)) {
        let change = changes[propName];
        switch (propName) {
          case 'selectedUser': {
            if (change.currentValue){
              this.userSelected(change.currentValue);
              this.isExistingThread = true;
            }
          }
          break;
        }
      }
    }
  }

  searchChanged(){
    
  }

  userSelected(selectedUser: User){

    this.selectedMessageUser = selectedUser;
    this.userSearchStr = null;
    this.messageService.getMessagesBetweenUsers(<string>this.authService.getAccount()?.key, <string>selectedUser.key)
      .subscribe({
        next: ((res) => {
          if (Array.isArray(res) && res.length){
            let groupedMessages = this.groupMessagesByDate(res);
            if (Array.isArray(groupedMessages)){
              this.messageListGrouped = groupedMessages;
            }
            else{
              this.messageListGrouped = [];
            }
            //this.conversationMessageList = res;
            this.changeDetectRef.detectChanges();
          }
          else{
            this.conversationMessageList = [];
            this.messageListGrouped = [];
            this.changeDetectRef.detectChanges();
          }
        }),
        error: ((err) => {
        }),
        complete: () => {
        },
      });
        
  }

  groupMessagesByDate(messageList: IM[]) : UniqueDay[] {
    let uniqueDays : UniqueDay[] = [];
    
    messageList.forEach((mL) => {
      let dateMillisec = new Date(<string>mL.msgDateStr).setHours(0,0,0,0);
      if (!uniqueDays.some((uniqueDay) => {
        return uniqueDay.dateMillisec == dateMillisec;
      })){
        let parsedDate = Date.parse(<string>mL.msgDateStr);
        let currDate = new Date(parsedDate);

        uniqueDays.push({
          dateMillisec: dateMillisec,
          imList: [mL], 
          dateFormatted: `${currDate.toLocaleString('default', { month: 'short' })} ${currDate.getDay()}`
        });
      }
      else{
        // Case where it does have the date, it should push on to (or create new) IM[]
        let existingUniqueDay = uniqueDays.find(day => day.dateMillisec == dateMillisec);
        if (existingUniqueDay){

          if (!Array.isArray(existingUniqueDay?.imList) || !existingUniqueDay?.imList.length){
            existingUniqueDay.imList = [mL];
          }
          else{
            existingUniqueDay.imList.push(mL);
          }
        }
      }
    });

    return uniqueDays;
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
