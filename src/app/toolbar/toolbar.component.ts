import { Component, Input, OnInit } from '@angular/core';
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

  constructor(
    private authService: AuthService,
    private router: Router,
  ) { }

  ngOnInit(): void {
  }

  openProfileContext(){
    this.selectedFooterItem = 'profile';
  }
  lockProfileCard(event : any){

    this.profCardLocked = true;
  }

  blurCard(event : any){

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
