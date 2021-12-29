import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-available-message-users',
  templateUrl: './available-message-users.component.html',
  styleUrls: ['./available-message-users.component.less']
})
export class AvailableMessageUsersComponent implements OnInit {
  @Output() userSelected : EventEmitter<any> = new EventEmitter();

  constructor() { }

  ngOnInit(): void {
  }

  userContactSelected(userFullNameStr: string){
    this.userSelected.emit(userFullNameStr);
  }

}
