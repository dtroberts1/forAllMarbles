import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/database';
import { map, Observable, Subscriber, tap, combineLatest, mergeMap } from 'rxjs';
import { IM } from '../models/im';
import { StatusNotification } from '../models/status-notification';
import { User } from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationPath = '/notifications';
  notifRef !: AngularFireList<StatusNotification>;
  constructor(private db: AngularFireDatabase) {
    this.notifRef = db.list(this.notificationPath);

   }

  create(notification: StatusNotification): any {
    return this.notifRef.push(notification);
  }
  markNotificationAsRead(notification: StatusNotification) : Promise<any>{
    notification.isRead = true;
    if (notification.key){
      return this.db.list(this.notificationPath).update(<string>notification.key, notification)
    }
    return Promise.resolve();
  }

  deleteNotification(notificationKey: string) : Promise<any>{
    return this.db.list(this.notificationPath).remove(notificationKey)
  }

  getNotificationsForUser(userKey: string) : Observable<StatusNotification[]>
  {
    return combineLatest([
    new Observable(
      subscriber => {
        this.notifRef.query.orderByChild('userKey')
        .equalTo(userKey).on('value', (snap: any) => {
          let val = snap.val();

          if (val){
            let notifications =  Object.keys(val).map((myKey : any, index: number) => <any>{
              key : myKey,
              ...val[Object.keys(val)[index]]
            });
  
            notifications = notifications ? notifications : [];
            subscriber.next(notifications)
          }
          else{
            subscriber.next([]);
          }

        });
      }
    ),
    new Observable(
      subscriber => {
        this.notifRef.query.orderByChild('userKey')
        .equalTo(userKey).on('value', (snap: any) => {
          // this is the _<user> part. need to combine (OR) this with user prefixed <user>_
          let val = snap.val();

          if (val){
            console.log({"keys": Object.keys(val)})
            let notifications =  <any[]>Object.keys(val).map((myKey : any, index: number) => <any>{
              key : myKey,
              ...val[Object.keys(val)[index]]
            });

            if (Array.isArray(notifications)){
              // Remove duplicates
              notifications = notifications.filter(notif => !notifications.some(mappedItm => mappedItm.key == notif.key));              
            }
  
            notifications = notifications ? notifications : [];
            subscriber.next(notifications)
  
          }
          else{
            subscriber.next([]);
          }
        });
      }
    ),
    ])
    .pipe(
      tap((itm: any[]) =>{
        console.log({"tappedItem":itm})
      }),
      map((itm : any[]) => {
        let reduced = itm.reduce((a : any, b : any) => { return a.concat(b); }, []) as StatusNotification[];
        return reduced.sort((a : StatusNotification, b: StatusNotification) => {
          return ('' + a.notificationDateStr).localeCompare('' + b.notificationDateStr);
        });
      })
    );
  }
}
