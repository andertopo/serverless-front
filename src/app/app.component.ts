import { AsyncPipe, NgFor } from '@angular/common';
import { Component, inject, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { BaseChartDirective } from 'ng2-charts';
import { Observable, tap } from 'rxjs';
import { ChartConfig, ChartsService } from './chart-service';
import { deviceTypes, genres, paymentMethods, subscriptionTypes } from './data-types';
import { FirestoreService } from './firestore-service';

@Component({
  selector: 'app-root',
  imports: [NgFor, FormsModule, RouterOutlet, BaseChartDirective, AsyncPipe],
  providers: [FirestoreService, ChartsService],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'serverless-front';
  @ViewChild('churnedUsers') chart: BaseChartDirective | undefined;
  @ViewChild('devices') devicesChart: BaseChartDirective | undefined;
  @ViewChild('favGenre') favoriteGenreChart: BaseChartDirective | undefined;
  @ViewChild('paymentMethods') paymentMethodsChart: BaseChartDirective | undefined;
  private firestoreService = inject(FirestoreService);
  private chartsService = inject(ChartsService);
  private pageSize = 2;
  churnedUsersBySubscriptionTypeConfig: ChartConfig;
  devicesConfig: ChartConfig;
  favoriteGenreConfig: ChartConfig;
  paymentMethodsConfig: ChartConfig;
  $users: Observable<any[]>;
  lastVisible: any;
  countryFilter: string = '';
  currentPage: number = 1;

  constructor() {
    this.$users = this.firestoreService.getFirstData(this.pageSize).pipe(
      tap((snapshot: any[]) => {
        this.lastVisible = snapshot[snapshot.length - 1];
        this.currentPage++;
      })
    );

    this.churnedUsersBySubscriptionTypeConfig = this.chartsService.createBarChartConfig(
      'Churned Users by Subscription Type',
      [
        { data: [10, 20, 30], label: 'Planes' },
      ],
      subscriptionTypes
    );

    this.devicesConfig = this.chartsService.createPieChartConfig(
      'Churned Users by Device Type',
      [0, 0, 0, 0],
      deviceTypes
    );
    this.paymentMethodsConfig = this.chartsService.createPieChartConfig(
      'Churned Users by Payment Method',
      [0, 0, 0, 0],
      paymentMethods
    );

    this.favoriteGenreConfig = this.chartsService.createBarChartConfig(
      'Favorite Genre by Age Group',
      genres.map(genre => ({ data: new Array(10).fill(0), label: genre })),
      ['0-10', '11-20', '21-30', '31-40', '41-50', '51-60', '61-70', '71-80', '81-90', '91-100']
    );

    this.firestoreService.getChurnedUsersBySubscriptionType().then((counts) => {
      this.churnedUsersBySubscriptionTypeConfig.data.datasets[0].data = counts.map(count => count.data().count);
      this.chart?.update();
    });

    this.firestoreService.getDeviceTypes().then((counts) => {
      this.devicesConfig.data.datasets[0].data = counts.map(count => count.data().count);
      this.devicesChart?.update();
    });

    this.firestoreService.getFavoriteGenere().then(counts => {
      for (let i = 0; i < counts.length; i += 10) {
        for (let j = 0; j < 10; j++) {
          this.favoriteGenreConfig.data.datasets[i / 10].data[j] = counts[i + j].data().count;
        }
      }
      this.favoriteGenreChart?.update();
    });
    this.firestoreService.getPaymentMethods().then(counts => {
      this.paymentMethodsConfig.data.datasets[0].data = counts.map(count => count.data().count);
      this.paymentMethodsChart?.update();
    });
  }

  loadPreviousPage() {
    if (this.currentPage > 1) {
      this.$users = this.firestoreService.getPreviousData(this.lastVisible, this.pageSize).pipe(
        tap((snapshot: any[]) => {
          this.lastVisible = snapshot[0];
          this.currentPage--;
        })
      );
    }
  }

  loadNextPage() {
    if (this.lastVisible) {
      this.$users = this.firestoreService.getNextData(this.lastVisible, this.pageSize).pipe(
        tap((snapshot: any[]) => {
          this.lastVisible = snapshot[snapshot.length - 1];
          this.currentPage++;
        })
      );
    }
  }

  applyCountryFilter() {
    if (this.countryFilter.trim() !== '') {
      this.$users = this.firestoreService.filterByUserId(this.countryFilter, this.pageSize);
    }
  }
}
