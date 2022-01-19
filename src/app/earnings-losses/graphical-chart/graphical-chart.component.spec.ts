import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GraphicalChartComponent } from './graphical-chart.component';

describe('GraphicalChartComponent', () => {
  let component: GraphicalChartComponent;
  let fixture: ComponentFixture<GraphicalChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GraphicalChartComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GraphicalChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
