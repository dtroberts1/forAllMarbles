import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Preferences } from '../interfaces/preferences';
import { FileUpload } from '../models/file-upload';

type ModalInput = {preferences: Preferences;} 

@Component({
  selector: 'app-preferences',
  templateUrl: './preferences.component.html',
  styleUrls: ['./preferences.component.less']
})
export class PreferencesComponent implements OnInit {
  url !: string | undefined;
  enableBackgroundImage : boolean = false;
  backgroundSizeOptions : string[] = [
    'auto',
    'contain',
    'cover',
    'unset',
  ]
  backgroundPosition !: string | undefined;
  backgroundPositionOptions: string [] = [
    'center center',
    'top',
    'bottom',
    'left',
    'right',
    'center',
  ]
  opacity !: number | null | undefined;
  backgroundSize !: string | undefined;
  formatLabel(value: number) {
    if (value >= 1000) {
      return Math.round(value / 1000) + 'k';
    }

    return value;
  }
  @Output() preferencesChanged = new EventEmitter();
  constructor(
    public dialogRef: MatDialogRef<PreferencesComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ModalInput,

  ) { }

  ngOnInit(): void {
    if (this.data.preferences.backgroundUrl){
      this.enableBackgroundImage = true;
    }
    this.url = this.data.preferences.backgroundUrl;
    this.backgroundSize = this.data.preferences.backgroundSize;
    this.opacity = this.data.preferences.opacity;
    this.backgroundPosition = this.data.preferences.backgroundPosition;
  }

  sliderChanged(event : any){
    this.emitChange();

  }

  backgroundPositionModified(){
    this.emitChange();
  }
  closeModal(canSave: boolean){
    if (canSave){
      this.dialogRef.close({
        backgroundUrl: this.url,
        backgroundSize: this.backgroundSize,
        backgroundPosition: this.backgroundPosition,
        opacity: this.opacity,
      });
    }
    else{
      this.dialogRef.close();
    }
  }

  objectFitModified(){
    this.emitChange();

  }

  attachmentAdded(event :any){
    
    if (event.target.files){
      let file = event.target.files.item(0);
      let fileUpload = new FileUpload(file);
      this.url = URL.createObjectURL(file);
      this.emitChange();
      /*
      this.attachmentsToLink.push({
        file: file,
        name: file.name,
        isLinked: true,
        notes: null,
        url: URL.createObjectURL(file),
        fileUpload: fileUpload,
        path: null,
      });
      */
    }
  }

  emitChange(){
    this.preferencesChanged.emit({preferences: {
      backgroundUrl: this.url,
      backgroundSize: this.backgroundSize,
      backgroundPosition: this.backgroundPosition,
      opacity: this.opacity,
    }});

  }
}
