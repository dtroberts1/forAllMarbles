import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList, AngularFireObject} from '@angular/fire/database';
import { map, Observable, tap } from 'rxjs';
import { Bid } from '../models/bid';
import { User } from '../models/user';


@Injectable({
  providedIn: 'root'
})
export class BidService {
  private bidPath = '/bids';
  bidsRef !: AngularFireList<Bid>;


  constructor(private db: AngularFireDatabase) { 
    this.bidsRef = db.list(this.bidPath);
    console.log({"bidsRef":this.bidsRef})
  }

  getAll(): Observable<Bid[]> {
    return this.bidsRef.snapshotChanges()
      .pipe(
        map((list : any[]) => {
          return list.map((itm: any) => <Bid>{
            key: itm.payload.key, ...itm.payload.val() 
        })}
      ));
  }

  getBidsForUser(userKey: string){
    // TODO

    return new Promise((resolve, reject) => {
      this.db.database.ref('bids')
        .orderByChild('bidCreatorKey')
              .equalTo(userKey)
              .once('value')
              .then((snap) => {
                let val = snap.val();
                val = val ? val : [];
                console.log({"userBids":val});
                resolve(val);
      })
      .catch((err) => {
        reject(err);
      });

    });
  }

  create(bid: Bid): Promise<any> {
    return new Promise((resolve, reject) => {
      this.bidsRef.push(bid)
        .then((res) => {
          console.log({"creationResult":res});
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        })
    });
  }

  update(key: string, value: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.bidsRef.update(key, value)
        .then(() => {
            resolve(true);
          })
          .catch((err) => {
            reject(err);
          })
    });
    
  }

  delete(key: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.bidsRef.remove(key)
        .then(() => {
            resolve(true);
          })
          .catch((err) => {
            reject(err);
          })
    });
  }

  deleteAll(): Promise<any> {

    return new Promise((resolve, reject) => {
      this.bidsRef.remove()
        .then(() => {
            resolve(true);
          })
          .catch((err) => {
            reject(err);
          })
    });
  }
}