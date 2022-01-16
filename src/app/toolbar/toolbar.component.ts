import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AuthUser } from '../models/user';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.less']
})
export class ToolbarComponent implements OnInit {
  selectedFooterItem = '';
  profCardLocked :boolean = false;
  @Input() authUser!: AuthUser | null;
  @ViewChild('profileCard') profileCard !: ElementRef;

  constructor(
    private authService: AuthService,
    private router: Router,
  ) { }

  ngOnInit(): void {
  }

  openProfileContext(){
    this.selectedFooterItem = 'profile';
    console.log("thisprofcard is " + this.profileCard)
    setTimeout(() => {
      if (this.profileCard){
        this.profileCard.nativeElement.focus();
      }
    }, 0);
  }
  lockProfileCard(event : any){

    this.profCardLocked = true;
  }

  blurCard(event : any){

    console.log("blurring card...")
    this.selectedFooterItem = null as any;
    this.profCardLocked = false;

  }

  logout(event: any){
    this.authService.SignOut()
      .then((res) => {
        this.router.navigate(['/login']);
      });
    }
}
