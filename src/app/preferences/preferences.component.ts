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
  nightMode : boolean | undefined = false;
  title = 'colorPicker';
  primaryColor : string = '#DA3E3E';
  accentColor : string = '#6DFCD9';
  arrayColors: any = {
    color1: '#2883e9',
    color2: '#e920e9',
    color3: 'rgb(255,245,0)',
    color4: 'rgb(236,64,64)',
    color5: 'rgba(45,208,45,1)'
  };
  selectedColor: string = 'color1';

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
    this.nightMode = this.data.preferences.nightMode;
    this.primaryColor = this.data.preferences.primaryColor ? this.data.preferences.primaryColor : '#DA3E3E';
    this.accentColor = this.data.preferences.accentColor ? this.data.preferences.accentColor : '#6DFCD9';
  }

  sliderChanged(event : any){
    this.emitChange();

  }

  colorChanged(){
    this.emitChange();
  }

  nightModeChanged(event: any){
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
        nightMode: this.nightMode,
        primaryColor: this.primaryColor,
        accentColor: this.accentColor,
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
      nightMode: this.nightMode,
      primaryColor: this.primaryColor,
      accentColor: this.accentColor,
    }});

  }
}
