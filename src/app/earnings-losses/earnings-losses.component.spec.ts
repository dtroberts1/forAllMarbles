import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EarningsLossesComponent } from './earnings-losses.component';

describe('EarningsLossesComponent', () => {
  let component: EarningsLossesComponent;
  let fixture: ComponentFixture<EarningsLossesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EarningsLossesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EarningsLossesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
