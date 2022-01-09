import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminChooseWinnerComponent } from './admin-choose-winner.component';

describe('AdminChooseWinnerComponent', () => {
  let component: AdminChooseWinnerComponent;
  let fixture: ComponentFixture<AdminChooseWinnerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminChooseWinnerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminChooseWinnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
