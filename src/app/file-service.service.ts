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
      const storageRef = this.storage.ref(`profileImages/${(<File>fileUpload.file).name}`);
      if (fileUpload){
        this.storage.upload(`profileImages/${(<File>fileUpload.file).name}`, fileUpload.file)
        .then((res) => {
          console.log({"res":res})
          console.log("in then..");
          firstValueFrom(storageRef.getDownloadURL()).then(downloadURL => {
            console.log({"downloadUrl":downloadURL})
            fileUpload.url = downloadURL;
            this.saveFileData(fileUpload);
            resolve(true);
          }).catch((err) => {reject(err)})
      });
      }
      else{
        reject('rejecting..')
      }
      });
  }

  private saveFileData(fileUpload: FileUpload): void {
    this.db.list('/images').push(fileUpload);
  }
}
