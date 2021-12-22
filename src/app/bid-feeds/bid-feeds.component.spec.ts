import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BidFeedsComponent } from './bid-feeds.component';

describe('BidFeedsComponent', () => {
  let component: BidFeedsComponent;
  let fixture: ComponentFixture<BidFeedsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BidFeedsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BidFeedsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
