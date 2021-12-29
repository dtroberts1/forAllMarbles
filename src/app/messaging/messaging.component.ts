import { Component, OnInit, Output, EventEmitter} from '@angular/core';

@Component({
  selector: 'app-messaging',
  templateUrl: './messaging.component.html',
  styleUrls: ['./messaging.component.less']
})
export class MessagingComponent implements OnInit {
  convoListExpanded: boolean = false;
  @Output() createNewMsgtCallback : EventEmitter<any> = new EventEmitter();

  constructor() { }

  ngOnInit(): void {
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
