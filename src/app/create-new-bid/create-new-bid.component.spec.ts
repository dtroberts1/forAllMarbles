import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateNewBidComponent } from './create-new-bid.component';

describe('CreateNewBidComponent', () => {
  let component: CreateNewBidComponent;
  let fixture: ComponentFixture<CreateNewBidComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateNewBidComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateNewBidComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
