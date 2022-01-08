import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BidConfirmationDialogComponent } from './bid-confirmation-dialog.component';

describe('BidConfirmationDialogComponent', () => {
  let component: BidConfirmationDialogComponent;
  let fixture: ComponentFixture<BidConfirmationDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BidConfirmationDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BidConfirmationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
