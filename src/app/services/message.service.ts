import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/database';
import { map, Observable, Subscriber, tap, combineLatest, mergeMap } from 'rxjs';
import { IM } from '../models/im';
import { User } from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private messagePath = '/messages';
  msgsRef !: AngularFireList<IM>;
  constructor(private db: AngularFireDatabase) {
    this.msgsRef = db.list(this.messagePath);

   }

  create(message: IM): any {
    return this.msgsRef.push(message);
  }

  getMessagesBetweenUsers(fromUserKey: string, toUserKey: string) : Observable<IM[]>
  {
    console.log("from user key is " + fromUserKey);
    return combineLatest([
    new Observable(
      subscriber => {
        this.msgsRef.query.orderByChild('fromToPair')
        .equalTo(`${fromUserKey}_${toUserKey}`).on('value', (snap: any) => {
          let val = snap.val();

          if (val){
            console.log({"val":val})
            let mappedMessages =  Object.keys(val).map((myKey : any, index: number) => <any>{
              key : myKey,
              ...val[Object.keys(val)[index]]
            });
  
            mappedMessages = mappedMessages ? mappedMessages : [];
            subscriber.next(mappedMessages)
          }
          else{
            subscriber.next([]);
          }

        });
      }
    ),
    new Observable(
      subscriber => {
        this.msgsRef.query.orderByChild('fromToPair')
        .equalTo(`${toUserKey}_${fromUserKey}`).on('value', (snap: any) => {
          // this is the _<user> part. need to combine (OR) this with user prefixed <user>_
          let val = snap.val();

          if (val){
            let mappedMessages =  Object.keys(val).map((myKey : any, index: number) => <any>{
              key : myKey,
              ...val[Object.keys(val)[index]]
            });
  
            mappedMessages = mappedMessages ? mappedMessages : [];
            subscriber.next(mappedMessages)
  
          }
          else{
            subscriber.next([]);
          }
        });
      }
    ),
    ])
    .pipe(
      map((itm : any[]) => {
        let reduced = itm.reduce((a : any, b : any) => { return a.concat(b); }, []) as IM[];
        return reduced.sort((a : IM, b: IM) => {
          return ('' + a.msgDateStr).localeCompare('' + b.msgDateStr);
        });
      })
    );
  }
}
