import { Injectable } from "@angular/core";
import { ChartConfiguration, ChartData, ChartDataset, ChartType } from "chart.js";

@Injectable({
  providedIn: 'root'
})
export class ChartsService {
  public createPieChartConfig(title: string, data: number[], labels: string[]): ChartConfig {
    return {
      type: 'pie',
      data: {
        labels: labels,
        datasets: [
          {
            data: data,
          },
        ],
      },
      config: {
        plugins: {
          title: {
            display: true,
            text: title,
          },
          legend: {
            display: false,
          },
          datalabels: {
            anchor: 'end',
            align: 'start',
            color: '#fff', // Set label color
            font: { weight: 'bold' },
            formatter: (value: any, ctx: any) => {
              return value; // Format label text
            },
          }
        },
      },
    } as ChartConfig;
  }

  public createBarChartConfig(title: string, data: ChartDataset[], labels: string[]): ChartConfig {
    return {
      type: 'bar',
      data: {
        labels: labels,
        datasets: data
      },
      config: {
        scales: {
          x: {},
          y: {
            min: 0,
          },
        },
        plugins: {
          title: {
            display: true,
            text: title,
          },
          legend: {
            display: false,
          },
          datalabels: {
            anchor: 'end',
            align: 'center',
          },
        },
      }
    } as ChartConfig;
  }
}

export interface ChartConfig {
  type: ChartType;
  data: ChartData<ChartType, number[], string | string[]>;
  config: ChartConfiguration['options'];
}
