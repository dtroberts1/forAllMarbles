import { Component, OnInit } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize, firstValueFrom, Observable } from 'rxjs';
import { FileService } from '../file-service.service';
import { FileUpload } from '../models/file-upload';
import { AuthService } from '../services/auth.service';


const states = [
'AL',
'AK',
'AS',
'AZ',
'AR',
'CA',
'CO',
'CT',
'DE',
'DC',
'FL',
'GA',
'GU',
'HI',
'ID',
'IL',
'IN',
'IA',
'KS',
'KY',
'LA',
'ME',
'MD',
'MA',
'MI',
'MN',
'MS',
'MO',
'MT',
'NE',
'NV',
'NH',
'NJ',
'NM',
'NY',
'NC',
'ND',
'MP',
'OH',
'OK',
'OR',
'PA',
'PR',
'RI',
'SC',
'SD',
'TN',
'TX',
'UT',
'VT',
'VA',
'VI',
'WA',
'WV',
'WI',
'WY',
]

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.less']
})
export class LoginComponent implements OnInit {
  loginTxt !: string;
  selectedFiles?: FileList;
  currentFileUpload?: FileUpload;
  percentage = 0;
  passwordTxt !: string;
  stateSelected !: string;
  addressStreet1Input = new FormControl('', [Validators.required, Validators.pattern(/\d+(\s+\w+\.?){1,}\s+(?:st(?:\.|reet)?|dr(?:\.|ive)?|pl(?:\.|ace)?|ave(?:\.|nue)?|rd(\.?)|road|lane|drive|way|court|plaza|square|run|parkway|point|pike|square|driveway|trace|park|terrace|blvd)+$/i)]);
  addressStreet2Input  = new FormControl('', [Validators.pattern(/^((APT|APARTMENT|SUITE|STE|UNIT){1} (NUMBER|NO|#)(\s){0,1}([0-9A-Z-]+)){0,1}/i)]);
  cityInput = new FormControl('', [Validators.required, Validators.pattern("^[a-zA-Z\u0080-\u024F]+(?:. |-| |')*([1-9a-zA-Z\u0080-\u024F]+(?:. |-| |'))*[a-zA-Z\u0080-\u024F]*$")]);
  stateInput  = new FormControl('',[Validators.required, Validators.pattern('^((A[LKZR])|(C[AOT])|(D[EC])|(FL)|(GA)|(HI)|(I[DLNA])|(K[SY])|(LA)|(M[EDAINSOT])|(N[EVHJMYCD])|(O[HKR])|(PA)|(RI)|(S[CD])|(T[NX])|(UT)|(V[TA])|(W[AVIY]))$')]);
  zipcodeInput = new FormControl('',  [Validators.required, Validators.pattern('^[0-9]{5}(?:-[0-9]{4})?$')]);
  states: string[] = states;
  selectedTabIndex: number = 0;
  constructor(
    private authService : AuthService,
    private router: Router,
    private fileService: FileService,
    private db: AngularFireDatabase,
  ) { }

  ngOnInit(): void {
  }
  createAcct(){
    let stA1 = this.addressStreet1Input.value;
    let stA2 = this.addressStreet2Input.value;
    let city = this.cityInput.value;
    let state = this.stateSelected;
    let zipcodeInput = this.zipcodeInput.value;
    this.upload()
      ?.then((res: any) => {
        if (this.currentFileUpload && this.currentFileUpload.url){
          this.authService.SignUp(this.loginTxt, this.passwordTxt, stA1, stA2, city, state, zipcodeInput,<string>this.currentFileUpload.url);
        }
      });
  }

  login(){
    /*
    this.loginTxt = 'mike@mike.com';
    this.passwordTxt = 'mike1234';
    */
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

  selectFile(event: any): void {
    this.selectedFiles = event.target.files;
  }

  upload(): Promise<any> | null{
    let taskPromise = null;

    if (this.selectedFiles) {
      const file: File | null = this.selectedFiles.item(0);
      this.selectedFiles = undefined;

      if (file) {
        this.currentFileUpload = new FileUpload(file);
        taskPromise = this.fileService.pushFileToStorage(`profImage_${new Date().getMilliseconds()}`, this.currentFileUpload);
      }
    }

    return taskPromise;
  }

  getInputErrorMessage(inputField : any){
    
    if (inputField.hasError('required')) {
      return 'error';
    }
    if (inputField.hasError(inputField)){
        return "Not a valid entry";
    }
    return "";
  }


  tabChanged(event: any){
    this.selectedTabIndex = event.index;
  }
}
