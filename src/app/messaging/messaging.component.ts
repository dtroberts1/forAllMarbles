import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-messaging',
  templateUrl: './messaging.component.html',
  styleUrls: ['./messaging.component.less']
})
export class MessagingComponent implements OnInit {
  convoListExpanded: boolean = false;

  constructor() { }

  ngOnInit(): void {
  }
  expandCollapseConvoList(){
    this.convoListExpanded = !this.convoListExpanded;
    

  }

}
