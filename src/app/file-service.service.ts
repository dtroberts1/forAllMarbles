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

  removeFilesFromStorage(baseFolder: string, storageFileName: string){
    const storageRef = this.storage.ref(`${baseFolder}}`);
    storageRef.child(storageFileName).delete();
  }

  removeFilesFromStorageViaUrl(url: string){
    // Remove objects in Storage 
    const storageRef = this.storage.refFromURL(url)
    storageRef.delete();

  }

  getFileFromStorageViaUrl(url: string, name: string) : Promise<File>{
    let ext = name.slice(name.lastIndexOf('.') + 1, name.length).toLowerCase();

    return new Promise((resolve, reject) => {

            // This can be downloaded directly:
        const xhr = new XMLHttpRequest();
        xhr.responseType = 'blob';
        xhr.onload = (event) => {
          const blob = xhr.response;
          resolve(new File([blob], name, {type: (ext === 'jpeg' || ext === 'jpg' ? 'image/jpeg' : (ext === 'png' ? 'image/png' : 'image/png'))}));
        };

        xhr.onerror = (event) => {
          reject(event);
        }

        xhr.open('GET', url);
        xhr.send();
      });

  }

  pushFileToStorage(baseFolder: string, storageFileName: string, fileUpload: FileUpload, saveToBaseImages : boolean): Promise<any>  {

    return new Promise((resolve, reject) => {
      const storageRef = this.storage.ref(`${baseFolder}/${(storageFileName)}`);
      if (fileUpload){
        this.storage.upload(`${baseFolder}/${(storageFileName)}`, fileUpload.file)
        .then((res) => {
          firstValueFrom(storageRef.getDownloadURL()).then(downloadURL => {
            fileUpload.url = downloadURL;
            if (saveToBaseImages){
              this.saveFileData(fileUpload);
            }
            resolve(true);
          }).catch((err) => {reject(err)})
      });
      }
      else{
      }
    });
  }


  private saveFileData(fileUpload: FileUpload): void {
    this.db.list('/images').push(fileUpload);
  }
}
