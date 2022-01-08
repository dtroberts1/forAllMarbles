import { Component, ElementRef, Inject, OnInit, SecurityContext, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { environment } from 'src/environments/environment';
import { FileService } from '../file-service.service';
import { Bid } from '../models/bid';
import { FileUpload } from '../models/file-upload';
import { SupportingDoc } from '../models/supporting-doc';
import { AuthUser, User } from '../models/user';
import { AuthService } from '../services/auth.service';
import { BidService } from '../services/bid.service';


type ModalInput = {isWinner: boolean; attachedFile: File; bid: Bid} 
type BidDocument = {file?:any; name ?: string, isLoading ?: boolean, isLinked : boolean, notes?: string | null, url ?: string | null, fileUpload ?: FileUpload | null, path ?: string | null} 

@Component({
  selector: 'app-doc-management-modal',
  templateUrl: './doc-management-modal.component.html',
  styleUrls: ['./doc-management-modal.component.less']
})
export class DocManagementModalComponent implements OnInit {
  bid !: Bid;
  attachmentsToLink !: BidDocument[];
  newFile !: File;
  selectedNoteAttachment !: BidDocument | null;
  openedNotesFormControl = new FormControl('', [Validators.required]);
  currAuthUser ?: AuthUser | null;
  @ViewChild('document_attachment_item')
  document_attachment_item!: ElementRef;
  
  constructor(
    public dialogRef: MatDialogRef<DocManagementModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ModalInput,
    private fileService: FileService,
    private authService: AuthService,
    private bidService: BidService,
    private domSanitizer:DomSanitizer,
  ) { }



  ngOnInit(): void {
    let existingAttachments : SupportingDoc[] = [];
    console.log("in init, is winner is " + this.data.isWinner);
    this.bid = this.data.bid;
    existingAttachments = this.getAttachmentsToLink(existingAttachments, true);

    let attachedFile = this.data.attachedFile;
    if (attachedFile){
      let fileUpload = new FileUpload(attachedFile);
      this.attachmentsToLink = [{file: attachedFile, name: attachedFile.name, isLinked: true, 
        notes: null, url: URL.createObjectURL(attachedFile), fileUpload: fileUpload, path: null,},
          ...existingAttachments];
    }
    else{
      this.attachmentsToLink = existingAttachments;
    }

    this.currAuthUser = this.authService.getAccount();

    console.log({"this.attachmentsToLink":this.attachmentsToLink});
  }

  getAttachmentsToLink(existingAttachments : SupportingDoc[], forThisUser: boolean){
    if (this.bid.winnerSupportingDocs && ((!forThisUser && !this.data.isWinner) || (this.data.isWinner && forThisUser))){
      console.log("in A")
      existingAttachments = Object.values(this.bid.winnerSupportingDocs).map(doc => <SupportingDoc>{
        name: doc.name, isLinked: doc.isLinked, url: doc.url, notes: doc.notes, path : doc.path,
      });
    }
    else if (this.bid.loserSupportingDocs && ((!forThisUser &&  this.data.isWinner ) || (!this.data.isWinner && forThisUser))){
      console.log("in B")
      existingAttachments = Object.values(this.bid.loserSupportingDocs).map(doc => <SupportingDoc>{
        name: doc.name, isLinked: doc.isLinked, url: doc.url, notes: doc.notes, path : doc.path,
      });
    }

    existingAttachments.forEach((attach) => {
        this.fileService.getFileFromStorageViaUrl(<string>attach.url, <string>attach.name)
          .then((result) => {
            if (result){
              let fileUpload = new FileUpload(result);
              attach.file = result;
              attach.fileUpload = fileUpload;
            }
        });
    });
    console.log({"existingAttacahments_AfterA":existingAttachments});
    return existingAttachments;
  }

  
  notifyChild(event: any){
    let index = event.index;
    let existingAttachments : SupportingDoc[] = [];
    console.log("index is " + index);
    switch(index){
      case 0:
        existingAttachments = this.getAttachmentsToLink(existingAttachments, true);
        this.attachmentsToLink = [...existingAttachments];
        this.selectedNoteAttachment = null;
        this.selectedNoteAttachment = null;
        break;
      case 1:
        existingAttachments = this.getAttachmentsToLink(existingAttachments, false);
        this.attachmentsToLink = [...existingAttachments];
        this.selectedNoteAttachment = null;
        this.selectedNoteAttachment = null;
        break; 
    }
  }

  getSafeUrl(url :string | null) {
    if(url){
      return this.domSanitizer.bypassSecurityTrustResourceUrl(url);
    }
    return '';
  }

  attachmentAdded(event: any, bid: Bid){
    
    if (event.target.files){
      let file = event.target.files.item(0);
      let fileUpload = new FileUpload(file);

      this.attachmentsToLink.push({
        file: file,
        name: file.name,
        isLinked: true,
        notes: null,
        url: URL.createObjectURL(file),
        fileUpload: fileUpload,
        path: null,
      });
    }

  }

  upload(): Promise<any>[]{
    let taskPromises : Promise<any>[]= [];

    if (Array.isArray(this.attachmentsToLink)){
      this.attachmentsToLink.filter(attach => attach.isLinked).forEach((attachment) => {

        let date = new Date();
        if (attachment) {
          let fileStr = attachment.name;
          if (fileStr){
            let ext = fileStr.slice(fileStr.lastIndexOf('.') + 1, fileStr.length).toLowerCase();
            attachment.fileUpload = new FileUpload(attachment.file);
            attachment.path = `supportingDoc_${date.getDay()}.${date.getMonth()}.${date.getFullYear()}${date.getMilliseconds()}.${ext}'`;
            taskPromises.push(this.fileService.pushFileToStorage(`supportingDocuments/${this.bid.key}${this.data.isWinner ? '/winnerDocs' : '/loserDocs'}`, `${attachment.path}`, 
            attachment.fileUpload, false));
          }
        }
      })
    }

    return taskPromises;
  }

  closeModal(){
    this.dialogRef.close();
  }
  openNotes(attachedDoc: BidDocument){
    this.openedNotesFormControl.setValue(attachedDoc.notes ? attachedDoc.notes : '');
    console.log({"OpenNotesDoc": attachedDoc})
    this.selectedNoteAttachment = attachedDoc;
  }

  cancelAttachmentChange(){
    this.openedNotesFormControl.setValue(null);
    console.log("setting notes to null")
    this.selectedNoteAttachment = null;
  }

  removeExistingBidAttachments(){
    let arr : SupportingDoc[] = [];

    if (this.data.isWinner){
      if (this.bid.winnerSupportingDocs){
        arr = Object.values(this.bid.winnerSupportingDocs);
      }
    }
    else{
      if (this.bid.loserSupportingDocs){
        arr = Object.values(this.bid.loserSupportingDocs);
      }
    }
    if (arr.length){
      arr.forEach((attachment) => {
        this.fileService.removeFilesFromStorageViaUrl(attachment.url ? attachment.url : '');
        attachment.url = null as any; // Point to nothing since removed.
        attachment.path = null as any;
      });
    }

    return this.bidService.clearData(`${this.bid.parentPath}${this.bid.key}/${this.data.isWinner ? 'winner' :'loser'}SupportingDocs`)
  }

  saveNotes(){
    let key = null;
    let supportingDoc = null;
    if (this.data.isWinner){
      if (this.bid.winnerSupportingDocs){
        supportingDoc = Object.entries(this.bid.winnerSupportingDocs);
      }
    }
    else{
      if (this.bid.loserSupportingDocs){
        supportingDoc = Object.entries(this.bid.loserSupportingDocs);
      }
    }

    let match = supportingDoc?.find(doc => doc[1].name === this.selectedNoteAttachment?.name);
    if (match){
      key = match[0];

      if (this.selectedNoteAttachment){
        this.selectedNoteAttachment.notes = this.openedNotesFormControl.value;
        this.bidService.putSupportingDocs(
          <SupportingDoc>{
            name : this.selectedNoteAttachment.name,
            url : this.selectedNoteAttachment.url,
            fileUpload: this.selectedNoteAttachment.fileUpload,
            isLinked: this.selectedNoteAttachment.isLinked,
            notes : this.selectedNoteAttachment.notes,
            path: this.selectedNoteAttachment.path,
            attachmentCreatorKey : this.currAuthUser ? this.currAuthUser.key : '',
          }, `${this.bid.parentPath}${this.bid.key}/${this.data.isWinner ? 'winner' :'loser'}SupportingDocs`, key
        )
      }
    }

  }

  saveAttachments(){

    // Remove existing attachments and re-upload
    this.removeExistingBidAttachments()
      .then(() => {
        // Upload docs to storage
        this.attachmentsToLink.forEach(attach => attach.isLoading = true);
        this.attachmentsToLink = this.attachmentsToLink.filter(attach => attach.isLinked == true);
        let promises =  this.upload();
        // Save Reference in database  
        Promise.all(promises)
          .then((res : any) => {
            let subPromises : Promise<any>[] = [];
            if (Array.isArray(this.attachmentsToLink)){
              this.attachmentsToLink.forEach((attachment) => {

                if (attachment.fileUpload){
                  subPromises.push(this.bidService.updateSupportingDocs({
                    name : attachment.name,
                    url : attachment.fileUpload?.url,
                    fileUpload: attachment.fileUpload,
                    isLinked: attachment.isLinked,
                    notes : attachment.notes ? attachment.notes : '',
                    path: attachment.path ? attachment.path : '',
                    attachmentCreatorKey : this.currAuthUser ? this.currAuthUser.key : '',
                  }, `${this.bid.parentPath}${this.bid.key}/${this.data.isWinner ? 'winner' :'loser'}SupportingDocs`));
                }
              });
              Promise.all(subPromises)
                .then(() => {
                  this.bidService.getSingleBid(this.bid)
                  .then((res) => {
                    let forThisUser = true;
                    this.bid = res;
                    let existingAttachments : SupportingDoc[] = [];
                    if (this.bid.winnerSupportingDocs && ((!forThisUser && !this.data.isWinner) || (this.data.isWinner && forThisUser))){
                      existingAttachments = Object.values(this.bid.winnerSupportingDocs).map(doc => <SupportingDoc>{
                        name: doc.name, isLinked: true, notes: doc.notes, url: doc.url, path : doc.path,
                      })
                    }
                    else if (this.bid.loserSupportingDocs && ((!forThisUser &&  this.data.isWinner ) || (!this.data.isWinner && forThisUser))){
                      existingAttachments = Object.values(this.bid.loserSupportingDocs).map(doc => <SupportingDoc>{
                        name: doc.name, isLinked: true, notes: doc.notes, url: doc.url, path : doc.path,
                      });                      
                    }

                    existingAttachments.forEach((attach) => {
                      this.fileService.getFileFromStorageViaUrl(<string>attach.url, <string>attach.name)
                        .then((result) => {

                          if (result){
                            let fileUpload = new FileUpload(result);
                            attach.file = result;
                            attach.fileUpload = fileUpload;
                          }
                      });
                    });

                    this.attachmentsToLink = [...existingAttachments as any];
                    this.attachmentsToLink.forEach(attach => attach.isLoading = false);

                  });
                })
            }
          });
      });
  }

}
