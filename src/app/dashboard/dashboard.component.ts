import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthUser } from '../models/user';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.less']
})
export class DashboardComponent implements OnInit {
  authUser !:AuthUser | null;

  constructor(
    private authService: AuthService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.authUser = this.authService.getAccount();
   
  }

  logout(){
    this.authService.SignOut()
      .then((res) => {
        this.router.navigate(['/login']);
      })
  }

}
