import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {AngularFireAuth, } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { AngularFireDatabase, AngularFireList, AngularFireObject} from '@angular/fire/database';
import { AuthUser, User } from '../models/user';
import { Bid } from '../models/bid';
import * as firebase from 'firebase';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private _isAuthenticated = false;
  private _user !: AuthUser | null;

  private userPath = '/users';
  usersRef !: AngularFireList<User>;

  constructor(
    private angularFireAuth: AngularFireAuth,
    private db: AngularFireDatabase,
    private router: Router,
    ) {
    this.userData = angularFireAuth.authState;
    this.usersRef = db.list(this.userPath);
    console.log({"usersRef":this.usersRef})
  }

  public getAccount(){
    return this._user;
  }

  public isAuthenticated(){
    return true;
  }

  userData: Observable<firebase.default.User | null>;
 
  
  /* Sign up */
  SignUp(email: string, password: string) : Promise<firebase.default.auth.UserCredential> {
    return new Promise((resolve, reject) => {
      this.angularFireAuth
      .createUserWithEmailAndPassword(email, password)
        .then((res: any) => {
          let obj = {
            bids : [],
            displayName : '',
            emailAddress: res.user.email,
          };
          this.db.database.ref('users').child(res.user.uid).set(obj);
          resolve(res);
        })
        .catch((error: any) => {
          reject(null);
        })
    });
  }

  SignInWithGoogle(){
    return new Promise((resolve, reject) => {
      let provider = new firebase.default.auth.GoogleAuthProvider()

      this.angularFireAuth.signInWithPopup(provider)
        .then((result) => {
          console.log({"result":result})
          // This gives you a Google Access Token. You can use it to access the Google API.
          this._isAuthenticated = true;
          this._user = <AuthUser>{
            key : result.user?.uid,
            emailAddress: result.user?.email,
          }
          /*
          const credential = firebase.default.auth.GoogleAuthProvider.credential(result) provider.credentialFromResult(result);
          const token = credential.accessToken;
          // The signed-in user info.
          result.user?.getIdToken()
            .then((res) => {
              
            })
          const user = result.user;
          */
          resolve(result);
  
          // ...
        }).catch((err: any) => {
          this._isAuthenticated = false;
          this._user = null;
          reject(err);
        });
    });
  }
  
  /* Sign in */
  SignIn(email: string, password: string) {
    return new Promise((resolve, reject) => {
      this.angularFireAuth
      .signInWithEmailAndPassword(email, password)
        .then((res : any) => {
          this._isAuthenticated = true;
          this._user = <AuthUser>{
            key : res.user.uid,
            emailAddress : res.user.email,
          }
          resolve(res);
        })
        .catch((err: any) => {
          this._isAuthenticated = false;
          this._user = null;
          reject(err);
        });
    });
  }
  
  /* Sign out */
  SignOut() {
    return new Promise((resolve, reject) => {
      this.angularFireAuth
      .signOut()
        .then((res) => {
          this._isAuthenticated = false;
          this._user = null;
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        })
    });

  }
}
