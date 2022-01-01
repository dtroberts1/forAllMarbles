import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AvailableMessageUsersComponent } from './available-message-users.component';

describe('AvailableMessageUsersComponent', () => {
  let component: AvailableMessageUsersComponent;
  let fixture: ComponentFixture<AvailableMessageUsersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AvailableMessageUsersComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AvailableMessageUsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
