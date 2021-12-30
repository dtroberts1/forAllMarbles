import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
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
  availUsers!: User[];

  constructor(
    private userService: UserService,
    private authService: AuthService,
  ) { }

  ngOnInit(): void {
    this.userService.getAll()
      .subscribe(
        res => {
          this.availUsers = res.filter(user => user.emailAddress != this.authService.getAccount()?.emailAddress);
        }
      )
  }

  userContactSelected(user: User){
    this.userSelected.emit(user);
  }

}
