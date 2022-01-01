import { Component, OnInit } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize, firstValueFrom, Observable } from 'rxjs';
import { FileService } from '../file-service.service';
import { FileUpload } from '../models/file-upload';
import { AuthService } from '../services/auth.service';
import { StateService } from '../services/state.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.less']
})
export class LoginComponent implements OnInit {
  loginTxt !: string;
  selectedFile !: File | null;
  selectedFiles?: FileList;
  currentFileUpload?: FileUpload;
  percentage = 0;
  passwordTxt !: string;
  stateSelected !: string;
  fNameInput = new FormControl('', [Validators.required]);
  lNameInput = new FormControl('', [Validators.required]);
  addressStreet1Input = new FormControl('', [Validators.required, Validators.pattern(/\d+(\s+\w+\.?){1,}\s+(?:st(?:\.|reet)?|dr(?:\.|ive)?|pl(?:\.|ace)?|ave(?:\.|nue)?|rd(\.?)|road|lane|drive|way|court|plaza|square|run|parkway|point|pike|square|driveway|trace|park|terrace|blvd)+$/i)]);
  addressStreet2Input  = new FormControl('', [Validators.pattern(/^((APT|APARTMENT|SUITE|STE|UNIT){1} (NUMBER|NO|#)(\s){0,1}([0-9A-Z-]+)){0,1}/i)]);
  cityInput = new FormControl('', [Validators.required, Validators.pattern("^[a-zA-Z\u0080-\u024F]+(?:. |-| |')*([1-9a-zA-Z\u0080-\u024F]+(?:. |-| |'))*[a-zA-Z\u0080-\u024F]*$")]);
  stateInput  = new FormControl('',[Validators.required, Validators.pattern('^((A[LKZR])|(C[AOT])|(D[EC])|(FL)|(GA)|(HI)|(I[DLNA])|(K[SY])|(LA)|(M[EDAINSOT])|(N[EVHJMYCD])|(O[HKR])|(PA)|(RI)|(S[CD])|(T[NX])|(UT)|(V[TA])|(W[AVIY]))$')]);
  zipcodeInput = new FormControl('',  [Validators.required, Validators.pattern('^[0-9]{5}(?:-[0-9]{4})?$')]);
  states: string[] = [];
  credentialsInvalid : boolean = false;
  selectedTabIndex: number = 0;
  constructor(
    private authService : AuthService,
    private router: Router,
    private fileService: FileService,
    private db: AngularFireDatabase,
    private stateService: StateService,
  ) { }

  ngOnInit(): void {
    this.states = this.stateService.getStateList();
  }
  createAcct(){
    let fName = this.fNameInput.value;
    let lName = this.lNameInput.value;
    let stA1 = this.addressStreet1Input.value;
    let stA2 = this.addressStreet2Input.value;
    let city = this.cityInput.value;
    let state = this.stateSelected;
    let zipcodeInput = this.zipcodeInput.value;
    this.upload()
      ?.then((res: any) => {
        console.log({"this.currentFileUpload":this.currentFileUpload})
        if (this.currentFileUpload && this.currentFileUpload.url){
          this.authService.SignUp(this.loginTxt, this.passwordTxt, fName, lName, stA1, stA2, city, state, zipcodeInput,<string>this.currentFileUpload.url)
            .then((res) =>{
              this.fNameInput.setValue(null);
              this.lNameInput.setValue(null);
              this.addressStreet1Input.setValue(null);
              this.addressStreet2Input.setValue(null);
              this.cityInput.setValue(null);
              this.stateInput.setValue(null);
              this.zipcodeInput.setValue(null);
              this.selectedFile = null;
              this.selectedTabIndex = 0;
            }).catch((err) =>{ 
              console.log({"err":err});
            })
        }
      })
      .catch((err) => {
        console.log({"err":err})
      })
  }

  login(){

    /*
    this.loginTxt = 'mike@mike.com';
    this.passwordTxt = 'mike1234';
    */
    this.authService.SignIn(this.loginTxt, this.passwordTxt)
      .then(() => {
        this.router.navigate(['/dashboard']);
      }).catch((err) => {

        this.credentialsInvalid = true;
      })
  }

  signInWithGoogle(){
    this.authService.SignInWithGoogle()
      .then(() => {
        this.router.navigate(['/dashboard']);
      });
  }

  selectFile(event: any): void {
    this.selectedFiles = event.target.files;
    if(this.selectedFiles){
      this.selectedFile = this.selectedFiles.item(0);

    }
  }

  upload(): Promise<any> | null{
    let taskPromise = null;

    if (this.selectedFile) {
      this.currentFileUpload = new FileUpload(this.selectedFile);
      taskPromise = this.fileService.pushFileToStorage(`profImage_${new Date().getMilliseconds()}`, this.currentFileUpload);
    }

    return taskPromise;
  }

  keyDown(event : any){
    console.log({"event":event})
    if (event.keyCode == 13){
      this.login();
    }
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
