import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList, AngularFireObject} from '@angular/fire/database';
import { map, Observable, tap } from 'rxjs';
import { User } from '../models/user';


@Injectable({
  providedIn: 'root'
})
export class UserService {
  private userPath = '/users';
  usersRef !: AngularFireList<User>;


  constructor(private db: AngularFireDatabase) { 
    this.usersRef = db.list(this.userPath);
  }


  getAll(): Observable<User[]> {
    return this.usersRef.snapshotChanges()
      .pipe(
        tap(
          (list: any[]) => {
            console.log({"list":list})
          }
        ),
        map((list : any[]) => {
          return list.map((itm: any) => <User>{
            fullName: `${itm.payload.val().firstName} ${itm.payload.val().lastName}`,
            cityState: `${itm.payload.val().city} ${itm.payload.val().state}`,
            key: itm.payload.key, ...itm.payload.val() 
        })}
      ));
  }

  getSingle(key: string): Promise<User>{
    return new Promise((resolve, reject) =>{
      this.usersRef.query.orderByKey().equalTo(key)
      .once('value')
        .then((snap) => {
          let retrievedVal = snap.val();
          let obj = <User>{
            key: Object.keys(retrievedVal)[0], ...retrievedVal[Object.keys(retrievedVal)[0]]
          } 
          resolve(obj);
        })
        .catch((err) => {
          reject(err);
        })
    })
  }

  create(user: User): any {
    return this.usersRef.push(user);
  }

  update(key: string, value: any): Promise<void> {
    return this.usersRef.update(key, value);
  }

  delete(key: string): Promise<void> {
    return this.usersRef.remove(key);
  }

  deleteAll(): Promise<void> {
    return this.usersRef.remove();
  }
}