import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { FirebaseService } from '../services/firebase.service';


@Component({
  selector: 'app-your-bids',
  templateUrl: './your-bids.component.html',
  styleUrls: ['./your-bids.component.less']
})
export class YourBidsComponent implements OnInit {


  constructor(
    private firebaseService: FirebaseService
    ) { 

  }

  ngOnInit(): void {
    this.firebaseService.getAll()
      .valueChanges()
        .subscribe(
          res => {
            console.log({"res":res});
          }
        )
  }

}
