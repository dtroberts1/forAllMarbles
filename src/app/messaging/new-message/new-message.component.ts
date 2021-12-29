import { Component, OnInit, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-new-message',
  templateUrl: './new-message.component.html',
  styleUrls: ['./new-message.component.less']
})
export class NewMessageComponent implements OnInit {
  @Output() closeNewMsgCallback : EventEmitter<any> = new EventEmitter();
  expanded: boolean = true;
  userSearchStr !: null;
  selectedMessageUser !: string | null;

  constructor() { }

  ngOnInit(): void {
  }
  closeNewMsgt(){
    console.log("closing new message")
    this.closeNewMsgCallback.emit();
  }

  removeSelectedUser(){
    this.selectedMessageUser = null;
  }

  userSelected(userSelectedStr: string){
    this.selectedMessageUser = userSelectedStr;
    console.log("selected user is " + userSelectedStr);
    this.userSearchStr = null;
  }

  stopPropagation(event: any){
    event.stopPropagation();
  }

  expandCollapse(){
    this.expanded = !this.expanded;

  }

}
