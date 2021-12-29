import { Component, OnInit, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-new-message',
  templateUrl: './new-message.component.html',
  styleUrls: ['./new-message.component.less']
})
export class NewMessageComponent implements OnInit {
  @Output() closeNewMsgCallback : EventEmitter<any> = new EventEmitter();
  expanded: boolean = true;

  constructor() { }

  ngOnInit(): void {
  }
  closeNewMsgt(){
    console.log("closing new message")
    this.closeNewMsgCallback.emit();
  }

  stopPropagation(event: any){
    event.stopPropagation();
  }

  expandCollapse(){
    this.expanded = !this.expanded;

  }

}
