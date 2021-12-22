import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList, AngularFireObject} from '@angular/fire/database';
import { Observable } from 'rxjs';
import { Bid } from '../models/bid';


@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private bidPath = '/bids';
  bidsRef !: AngularFireList<Bid>;


  constructor(private db: AngularFireDatabase) { 
    this.bidsRef = db.list(this.bidPath);
  }

  getAll(): AngularFireList<Bid> {
    return this.bidsRef;
  }

  create(tutorial: Bid): any {
    return this.bidsRef.push(tutorial);
  }

  update(key: string, value: any): Promise<void> {
    return this.bidsRef.update(key, value);
  }

  delete(key: string): Promise<void> {
    return this.bidsRef.remove(key);
  }

  deleteAll(): Promise<void> {
    return this.bidsRef.remove();
  }
}