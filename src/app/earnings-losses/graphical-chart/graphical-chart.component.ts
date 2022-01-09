import { AfterViewInit, Component, ElementRef, Input, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { BarController, BarElement, CategoryScale, Chart, Legend, LinearScale, Title, TooltipItem, TooltipModel, } from 'chart.js';
import colorLib from '@kurkle/color';
import { Bid } from 'src/app/models/bid';
import { Tooltip } from 'chart.js';

type BidNameWithAmt = {bidName: string, bidAmount: number};

Chart.register(BarController);
Chart.register(CategoryScale);
Chart.register(LinearScale);
Chart.register(BarElement);
Chart.register(Tooltip);
Chart.register(Legend);
Chart.register(Title);

const COLORS = [
  '#4dc9f6',
  '#f67019',
  '#f53794',
  '#537bc4',
  '#acc236',
  '#166a8f',
  '#00a950',
  '#58595b',
  '#8549ba'
];

const CHART_COLORS = {
  red: 'rgb(255, 99, 132)',
  orange: 'rgb(255, 159, 64)',
  yellow: 'rgb(255, 205, 86)',
  green: 'rgb(75, 192, 192)',
  blue: 'rgb(54, 162, 235)',
  purple: 'rgb(153, 102, 255)',
  grey: 'rgb(201, 203, 207)'
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];

const NAMED_COLORS = [
  CHART_COLORS.red,
  CHART_COLORS.orange,
  CHART_COLORS.yellow,
  CHART_COLORS.green,
  CHART_COLORS.blue,
  CHART_COLORS.purple,
  CHART_COLORS.grey,
];
var BAR_COLORS = ["red", "green","blue","orange","brown"];


@Component({
  selector: 'app-graphical-chart',
  templateUrl: './graphical-chart.component.html',
  styleUrls: ['./graphical-chart.component.less']
})
export class GraphicalChartComponent implements AfterViewInit{
  @ViewChild('earningsBarChart') 
  private storeSalesBarChart!: ElementRef;
  @Input() data !: BidNameWithAmt[];
  chartInstance!: Chart;

  constructor() { }

  ngAfterViewInit(): void {
    if (Array.isArray(this.data) && this.data.length){
      this.setupChart();
    }    
  }

  setupChart(){
    this.chartInstance = new Chart(this.storeSalesBarChart.nativeElement, {
      type: 'bar',
      data: {
        labels: Array.isArray(this.data) ? this.data.map(itm => itm.bidName) : [],
        datasets: [
        {
          borderColor: CHART_COLORS.red,
          data: Array.isArray(this.data) ? this.data.map(itm => itm.bidAmount) : [],
          hoverBorderWidth: 5,
          hoverBorderColor: '#42b7ff',
          label: 'Dataset 2',
          backgroundColor: "#FF4A4A", //BAR_COLORS,
        },
      ]
      },
      options: {
        maintainAspectRatio: false,
        responsive: true,
        scales: {
          y: {
            ticks: {
              font :{
                size: 20,
              }
            }
          },
          x: {
            ticks: {
              font :{
                size: 20,
              }
            }
          },
        },        
        plugins: {
          legend: {
            display: false,
          },
          
          title: {
            display: true,
            text: `Previous ${this.data.length} Finalized Bids`,
            font: {
              size: 23,
            }
          },
          tooltip: {
            callbacks: {
              label: function(tooltipItem) {
                return ` ${parseInt(tooltipItem.formattedValue) >= 0 ? ('$' + tooltipItem.formattedValue) : '-$' + (parseInt(tooltipItem.formattedValue) * -1)}`;
              },
              
              
            }
          }
        }
      },
    });
  }

  
  ngOnChanges(changes: SimpleChanges) {
    for (const propName in changes) {
      if (changes.hasOwnProperty(propName)) {
        let change = changes[propName];

        switch (propName) {
          case 'data': {
            if (Array.isArray(change.currentValue) && change.currentValue.length){
              this.setupChart();
            }
          }
        }
      }
    }
  }

  namedColor(index :number) {
    return NAMED_COLORS[index % NAMED_COLORS.length];
  }

  getColor(index: number) {
    return COLORS[index % COLORS.length];
  }

  transparentize(value : any, opacity : any) {
    var alpha = opacity === undefined ? 0.5 : 1 - opacity;
    return colorLib(value).alpha(alpha).rgbString();
  }

}
