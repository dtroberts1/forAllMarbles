import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.less']
})
export class LoginComponent implements OnInit {
  loginTxt !: string;
  passwordTxt !: string;
  selectedTabIndex: number = 0;
  constructor(
    private authService : AuthService,
    private router: Router,
  ) { }

  ngOnInit(): void {
  }
  createAcct(){
    this.authService.SignUp(this.loginTxt, this.passwordTxt)
  }

  login(){
    this.loginTxt = 'sarah@sarah.com';
    this.passwordTxt = 'sarah1234';
    this.authService.SignIn(this.loginTxt, this.passwordTxt)
      .then(() => {
        this.router.navigate(['/dashboard']);
      });
  }

  signInWithGoogle(){
    this.authService.SignInWithGoogle()
      .then(() => {
        this.router.navigate(['/dashboard']);
      });
  }

  tabChanged(event: any){
    this.selectedTabIndex = event.index;
  }
}
