import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayerComparisonChartComponent } from './player-comparison-chart.component';

describe('PlayerComparisonChartComponent', () => {
  let component: PlayerComparisonChartComponent;
  let fixture: ComponentFixture<PlayerComparisonChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlayerComparisonChartComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PlayerComparisonChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
