import { ComponentFixture, TestBed } from '@angular/core/testing';

import { YourBidsComponent } from './your-bids.component';

describe('YourBidsComponent', () => {
  let component: YourBidsComponent;
  let fixture: ComponentFixture<YourBidsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ YourBidsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(YourBidsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
