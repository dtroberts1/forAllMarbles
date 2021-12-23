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
  }

  getAll(): Observable<Bid[]> {
    return this.bidsRef.snapshotChanges()
      .pipe(
        map((list : any[]) => {
          return list.map((itm: any) => <Bid>{
            key: itm.payload.key,
            arrayBids: this.getBidsRecursively( itm.payload.val().bids),
            ...itm.payload.val(),
        })}
      ))
      .pipe(
        map((list : any[]) => {
          return list.map((itm: any) => <Bid>{
            key: itm.key,
            bids: itm.arrayBids,
            bidAmount : itm.bidAmount,
            bidChallengerKey : itm.bidChallengerKey,
            bidCreatorKey : itm.bidCreatorKey,
            bidMessage : itm.bidMessage,
            bidCreatorChallengerKey : itm.bidCreatorChallengerKey,
            title: itm.title,
        })}
      )
      )
  }

  
  getBidsRecursively(childBidsObj: any){
    if (childBidsObj && childBidsObj != -1){
      let mappedBids : any[] =  Object.keys(childBidsObj).map((myKey : any, index: number) => <Bid>{
        key : myKey,
        arrayBids: this.getBidsRecursively( childBidsObj[Object.keys(childBidsObj)[index]].bids),
        ...childBidsObj[Object.keys(childBidsObj)[index]]
      });
      if (Array.isArray(mappedBids)){
        mappedBids.forEach((mappedBid) => {
          mappedBid.bids = mappedBid.arrayBids;
          delete mappedBid.arrayBids;
        });
      }
      
      return mappedBids ? mappedBids : [];
    }
    else{
      return [];
    }
  }

  getBidsForUser(userKey: string): Observable<Bid[]>{
    return new Observable(
      subscriber => {
        this.db.database.ref('bids')
        .orderByChild('bidCreatorChallengerKey')
              .equalTo(userKey)
              .on('value', (snap : any) => {
                let val = snap.val();

                let mappedBids =  Object.keys(val).map((myKey : any, index: number) => <any>{
                    key : myKey,
                    arrayBids: this.getBidsRecursively( val[Object.keys(val)[index]].bids),
                    ...val[Object.keys(val)[index]]
                  });
                  if (Array.isArray(mappedBids)){
                    mappedBids.forEach((mappedBid) => {
                      mappedBid.bids = mappedBid.arrayBids;
                      delete mappedBid.arrayBids;
                    });
                  }
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