import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import { Bid } from '../models/bid';
import { User } from '../models/user';
import { UserService } from '../services/user.service';

type ModalInput = {bid: Bid;} 

@Component({
  selector: 'app-admin-choose-winner',
  templateUrl: './admin-choose-winner.component.html',
  styleUrls: ['./admin-choose-winner.component.less']
})
export class AdminChooseWinnerComponent implements OnInit {
  userSelected !: User;
  competingUsers !: User[];
  constructor(
    public dialogRef: MatDialogRef<AdminChooseWinnerComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ModalInput,
    private userService: UserService,
  ) { }

  ngOnInit(): void {
    let bid = this.data.bid;
    if (bid){
      firstValueFrom(this.userService.getAll())
        .then((res) => {
          if (Array.isArray(res) && res.length){
            this.competingUsers = res.filter(user => user.key === bid.declaredWinner || user.key === bid.declaredLoser);
          }
        });
    }    
  }

  closeModal(){
    this.dialogRef.close(null);
  }
  confirm(){
    this.dialogRef.close(this.userSelected);
  }

}
