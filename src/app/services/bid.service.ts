import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList} from '@angular/fire/database';
import { firstValueFrom, map, Observable, Subscriber, tap } from 'rxjs';
import { Bid } from '../models/bid';
import { SupportingDoc } from '../models/supporting-doc';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class BidService {
  private bidPath = '/bids';
  bidsRef !: AngularFireList<Bid>;


  constructor(
    private db: AngularFireDatabase,
    private toastr: ToastrService) { 
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
            bidChallengerKey : itm.bidChallengerKey ? itm.bidChallengerKey : 'NULL',
            bidCreatorKey : itm.bidCreatorKey,
            bidMessage : itm.bidMessage,
            bidCreatorChallengerKey : itm.bidCreatorChallengerKey,
            title: itm.title,
            rootBidKey: itm.rootBidKey,
            parentPath: itm.parentPath,
            isApproved : itm.isApproved,
            hasResult : itm.hasResult,
            resultVerified : itm.resultVerified,
            isCancelled : itm.isCancelled,
            declaredWinner : itm.declaredWinner,
            declaredLoser : itm.declaredLoser,
            winnerSupportingDocs : itm.winnerSupportingDocs,
            loserSupportingDocs : itm.loserSupportingDocs,
            verifiedWinner: itm.verifiedWinner,
            verifiedLoser: itm.verifiedLoser,
            verifiedDate: itm.verifiedDate,
        })}
      )
      )
  }

  getBidsFilteredByUserHelper(bid: Bid, userKey: string){
    let bids : Bid[] = [];
    if (bid == null){
      return []
    }
    if (bid.bidCreatorKey == userKey){
      bids.push(bid);
      return bids;
    }
    else if(Array.isArray(bid.bids) && bid.bids.length){
      bid.bids.forEach((currBid) => {
        let filteredBids = this.getBidsFilteredByUserHelper(currBid, userKey);
        if(Array.isArray(filteredBids) && filteredBids.length){
          bids = [...bids, ...filteredBids];
        }
      });
    }
    return bids;
  }

  getBidsFilteredByUser(bids: Bid[], userKey: string): Bid[]{
    let filteredBids : Bid[] = [];
    if (Array.isArray(bids) && bids.length){
      bids.forEach((bid) => {
        if (bid.bidCreatorKey == userKey){
          filteredBids.push(bid);
        }
        else{
          let tmpBids = this.getBidsFilteredByUserHelper(bid, userKey);
          if (Array.isArray(tmpBids) && tmpBids.length){
            filteredBids = [...filteredBids, ...tmpBids];
          }
        }
      });
    }

    return filteredBids;

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

  createNested(bid: Bid): Promise<any> {
    return new Promise((resolve, reject) => {
      delete bid.isNew;

      let path = '/bids/'
      this.db.list(path).push(bid)
        .then((res) => {
          this.toastr.success("Bid Created");
            resolve(true);
          })
          .catch((err : any) => {
            this.toastr.error("Unable to Process");
            reject(err);
          })
    });
  }

  create(bid: Bid): Promise<any> {
    return new Promise((resolve, reject) => {
      this.bidsRef.push(bid)
        .then((res : any) => {
          this.toastr.success("Bid Created");
          resolve(res);
        })
        .catch((err : any) => {
          this.toastr.error("Unable to Process");
          reject(err);
        })
    });
  }

  update(key: string, value: Bid): Promise<any> {

    // Delete properties that have null
    value = Object.fromEntries(Object.entries(value).filter(([_, v]) => v != null));


    return new Promise((resolve, reject) => {

      this.db.list(<string>value.parentPath).update(key, value)
        .then((res) => {
          this.toastr.success("Bid Saved");
            resolve(true);
          })
          .catch((err : any) => {
            this.toastr.error("Unable to Process");
            reject(err);
          })
    });
    
  }

  addNewChildToParent(value: Bid): Promise<any> {
    return new Promise((resolve, reject) => {

      this.db.list(<string>value.parentPath).push(value)
        .then((res) => {
            this.toastr.success("Bid Created");
            resolve(true);
          })
          .catch((err : any) => {
            this.toastr.error("Unable to Process");
            reject(err);
          })
    });
  }

  clearData(path: string): Promise<any>{
    return new Promise((resolve, reject) => {

      this.db.list(path).remove()
        .then((res) => {
            resolve(true);
          })
          .catch((err : any) => {
            this.toastr.error("Unable to Process");
            reject(err);
          })
    });
  }

  updateSupportingDocs(value: SupportingDoc, path: string): Promise<any> {
    return new Promise((resolve, reject) => {

      this.db.list(path).push(value)
        .then((res) => {
            this.toastr.success("Documents Saved");
            resolve(true);
          })
          .catch((err : any) => {
            this.toastr.error("Unable to Process");
            reject(err);
          })
    });
  }

  putSupportingDocs(value: SupportingDoc, path: string, key : string): Promise<any> {
    return new Promise((resolve, reject) => {

      this.db.list(path).update(key, value)
        .then((res) => {
            this.toastr.success("Documents Saved");
            resolve(true);
          })
          .catch((err : any) => {
            this.toastr.error("Unable to Process");
            reject(err);
          })
    });
  }

  delete(path: string, key: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.db.list(path).remove(key)
        .then(() => {
            this.toastr.success("Bid Removed");
            resolve(true);
          })
          .catch((err : any) => {
            this.toastr.error("Unable to Process");
            reject(err);
          })
    });
  }

  getSingleBid(bid: Bid): Promise<any>{
      return firstValueFrom(
      this.db.object(`${bid.parentPath}${bid.key}`).valueChanges()
      .pipe(
        map((itm : any) => 
          <Bid>{
            key: bid.key, /* Key Doesn't come back from valueChanges(). Have to set manually */
            ...itm,
        }
      )
    ));
  }

  deleteAll(): Promise<any> {

    return new Promise((resolve, reject) => {
      this.bidsRef.remove()
        .then(() => {
            this.toastr.success("Bids Removed");
            resolve(true);
          })
          .catch((err : any) => {
            this.toastr.error("Unable to Process");
            reject(err);
          })
    });
  }
}