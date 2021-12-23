import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList, AngularFireObject} from '@angular/fire/database';
import { combineLatest, map, Observable, Subscriber, tap } from 'rxjs';
import { Bid } from '../models/bid';
import { User } from '../models/user';
declare var querybase: any;


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

  getBidsForUser(userKey: string): Observable<Bid[]>{
    return new Observable(
      subscriber => {
        let myobj = this.db.database.ref('bids')
        .orderByChild('bidCreatorChallengerKey')
              .equalTo(userKey)
              .on('value', (snap : any) => {
                let val = snap.val();
                console.log({"val":val})
                let mappedBids =  Object.keys(val).map((myKey : any, index: number) => <Bid>{
                    key : myKey,
                    ...val[Object.keys(val)[index]]
                  });
                
                  mappedBids = mappedBids ? mappedBids : [];
                  subscriber.next(mappedBids);
              },
              error => {
                subscriber.error(error);
              }
            )
      },      
    )
  }

  create(bid: Bid): Promise<any> {
    return new Promise((resolve, reject) => {
      this.bidsRef.push(bid)
        .then((res : any) => {
          console.log({"creationResult":res});
          resolve(res);
        })
        .catch((err : any) => {
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
          .catch((err : any) => {
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
          .catch((err : any) => {
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
          .catch((err : any) => {
            reject(err);
          })
    });
  }
}