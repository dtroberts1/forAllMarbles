import { Injectable } from '@angular/core';
import { FileUpload } from './models/file-upload';
import{AngularFireStorage, AngularFireUploadTask} from '@angular/fire/storage';
import { AngularFireDatabase } from '@angular/fire/database';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FileService {

  constructor(
    private db: AngularFireDatabase, private storage: AngularFireStorage
  ) { }

  pushFileToStorage(storageFileName: string, fileUpload: FileUpload): Promise<any>  {

    return new Promise((resolve, reject) => {
      //const filePath = `C:\\Users\\drobe\\Desktop\\chessgame.PNG`;
      console.log({"storageFileName": storageFileName})
      const storageRef = this.storage.ref(`profileImages`);
      const uploadTask = this.storage.upload(`profileImages/${storageFileName}`, fileUpload.file);
      
      firstValueFrom(uploadTask.snapshotChanges())
        .then(() => {
            firstValueFrom(storageRef.getDownloadURL()).then(downloadURL => {
              fileUpload.url = downloadURL;
              this.saveFileData(fileUpload);
              resolve(true);
            }).catch((err) => {reject(err)})
        }).catch((err) => {
          reject(err);
        })
      });
  }

  private saveFileData(fileUpload: FileUpload): void {
    this.db.list('/images').push(fileUpload);
  }
}
