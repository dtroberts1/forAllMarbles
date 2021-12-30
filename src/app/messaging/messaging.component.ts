import { Component, OnInit, Output, EventEmitter} from '@angular/core';
import { User } from '../models/user';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-messaging',
  templateUrl: './messaging.component.html',
  styleUrls: ['./messaging.component.less']
})
export class MessagingComponent implements OnInit {
  convoListExpanded: boolean = false;
  @Output() createNewMsgtCallback : EventEmitter<any> = new EventEmitter();
  availUsers!: User[];

  constructor(
    private userService: UserService,
  ) { }

  ngOnInit(): void {
    this.userService.getAll()
      .subscribe(
        res => {
          console.log({"users":res});
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
