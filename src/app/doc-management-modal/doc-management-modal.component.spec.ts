import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocManagementModalComponent } from './doc-management-modal.component';

describe('DocManagementModalComponent', () => {
  let component: DocManagementModalComponent;
  let fixture: ComponentFixture<DocManagementModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DocManagementModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DocManagementModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
