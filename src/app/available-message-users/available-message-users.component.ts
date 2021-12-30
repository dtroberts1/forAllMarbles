import { Component, OnInit, Output, EventEmitter, Input, SimpleChanges } from '@angular/core';
import { User } from '../models/user';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-available-message-users',
  templateUrl: './available-message-users.component.html',
  styleUrls: ['./available-message-users.component.less']
})
export class AvailableMessageUsersComponent implements OnInit {
  @Output() userSelected : EventEmitter<any> = new EventEmitter();
  @Input() searchParameters !: string | null;
  filteredUsers!: User[];
  allUsers!: User[];

  constructor(
    private userService: UserService,
    private authService: AuthService,
  ) { }

  ngOnInit(): void {
    this.userService.getAll()
      .subscribe(
        res => {
          this.allUsers = res.filter(user => user.emailAddress != this.authService.getAccount()?.emailAddress);
          this.filteredUsers = this.getFilteredAvailUsers(this.allUsers);

        }
      )
  }

  getFilteredAvailUsers(availUsers : User[]){
    if (this.searchParameters && this.searchParameters.length){
      return availUsers.filter(user => user.fullName?.toLowerCase()?.startsWith(<string>this.searchParameters?.toLowerCase()))
    }
    else{
      return [];
    }
  }

  userContactSelected(user: User){
    this.userSelected.emit(user);
  }
  
  ngOnChanges(changes: SimpleChanges) {
    for (const propName in changes) {
      if (changes.hasOwnProperty(propName)) {
        let change = changes[propName];
        switch (propName) {
          case 'searchParameters': {
            if (change.currentValue){
              if (Array.isArray(this.allUsers)){
                this.filteredUsers = this.getFilteredAvailUsers(this.allUsers);
              }
              else{
                this.filteredUsers = [];
                this.allUsers = [];
              }
            }
          }
          break;
        }
      }
    }
  }

}
