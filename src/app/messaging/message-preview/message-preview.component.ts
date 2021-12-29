import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-message-preview',
  templateUrl: './message-preview.component.html',
  styleUrls: ['./message-preview.component.less']
})
export class MessagePreviewComponent implements OnInit {
  @Input() isLastElm!: boolean;
  constructor() { }

  ngOnInit(): void {
    
  }

}
