import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideCharts(withDefaultRegisterables()),
    provideFirebaseApp(() => initializeApp({
      projectId: "app-test-559a8",
      appId: "1:685710555179:web:ffd25562993c6afc26d26e",
      databaseURL: "https://app-test-559a8.firebaseio.com",
      storageBucket: "app-test-559a8.appspot.com",
      apiKey: "AIzaSyBqmJNb6V5GAVbuyfOCTp89kC3SSoplWBA",
      authDomain: "app-test-559a8.firebaseapp.com",
      messagingSenderId: "685710555179",
      measurementId: "G-D1M6LT4WS2",
      // projectNumber: "685710555179",
      // version: "2"
    })),
    provideFirestore(() => {
      const firestore = getFirestore('serverless');
      return firestore;
    })
  ]
};
