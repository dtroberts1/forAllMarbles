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

    setTimeout(() => {
      this.selectedFooterItem = null as any;
      this.profCardLocked = false;
  
    }, 150)
  }

  logout(event: any){
    event.stopPropagation();
    this.authService.SignOut()
      .then((res) => {
        this.router.navigate(['/login']);
      });
    }
}
