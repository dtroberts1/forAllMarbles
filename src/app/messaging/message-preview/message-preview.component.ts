import { Component, Input, OnInit, Output, EventEmitter} from '@angular/core';
import { User } from 'src/app/models/user';

@Component({
  selector: 'app-message-preview',
  templateUrl: './message-preview.component.html',
  styleUrls: ['./message-preview.component.less']
})
export class MessagePreviewComponent implements OnInit {
  @Input() isLastElm!: boolean;
  @Input() user !: User;
  @Input() contents !: string;
  @Input() dateStr !: string;
  @Input() imgSrc !: string;
  @Output() onSelected : EventEmitter<any> = new EventEmitter();


  constructor() { }

  ngOnInit(): void {
    
  }

  itemSelected(){
    this.onSelected.emit(this.user);
  }

}
