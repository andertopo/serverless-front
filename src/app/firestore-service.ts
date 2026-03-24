import { inject, Injectable } from "@angular/core";
import { collectionData, Firestore } from "@angular/fire/firestore";
import { collection, CollectionReference, DocumentData, endBefore, getCountFromServer, limit, orderBy, query, startAfter, where } from "firebase/firestore";
import { deviceTypes, genres, paymentMethods, subscriptionTypes } from "./data-types";

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {
  private firestore = inject(Firestore);
  private collectionName = 'serverless';
  collectionRef: CollectionReference<DocumentData, DocumentData>;

  constructor() {
    this.collectionRef = collection(this.firestore, this.collectionName);
  }

  public getFirstData(pageSize: number) {
    const userQuery = query(
      this.collectionRef,
      orderBy('user_id'),
      limit(pageSize)
    );
    return collectionData(userQuery);
  }

  public getNextData(lastVisibleDoc: any, pageSize: number) {
    console.log('Fetching next data after user_id:', lastVisibleDoc.user_id);
    const nextQuery = query(
      this.collectionRef,
      orderBy('user_id'),
      startAfter(lastVisibleDoc.user_id),
      limit(pageSize));
    return collectionData(nextQuery);
  }

  public getPreviousData(lastVisibleDoc: any, pageSize: number) {
    console.log('Fetching previous data before user_id:', lastVisibleDoc.user_id);
    const previousQuery = query(
      this.collectionRef,
      orderBy('user_id'),
      endBefore(lastVisibleDoc.user_id),
      limit(pageSize));
    return collectionData(previousQuery);
  }

  public filterByUserId(userId: string, pageSize: number) {
    const userQuery = query(
      this.collectionRef,
      where('user_id', '==', userId),
      limit(pageSize)
    );
    return collectionData(userQuery);
  }

  public async getChurnedUsersBySubscriptionType() {
    const queries = subscriptionTypes.map(subscriptionType => {
      return query(
        this.collectionRef,
        where('churned', '==', true),
        where('subscription_type', '==', subscriptionType),
      );
    });
    return Promise.all(queries.map(getCountFromServer));
  }

  public async getDeviceTypes() {
    const queries = deviceTypes.map(deviceType => {
      return query(
        this.collectionRef,
        where('primary_device', '==', deviceType),
      );
    });
    return Promise.all(queries.map(getCountFromServer));
  }

  public async getPaymentMethods() {
    const queries = paymentMethods.map(paymentMethod => {
      return query(
        this.collectionRef,
        where('payment_method', '==', paymentMethod),
      );
    });
    return Promise.all(queries.map(getCountFromServer));
  }

  public async getFavoriteGenere() {
    let queries: any[] = [];
    genres.map(genre => {
      for (let ageGroup = 10; ageGroup <= 100; ageGroup += 10) {
        queries.push(query(
          this.collectionRef,
          where('favorite_genre', '==', genre),
          where('age', '>', ageGroup - 10),
          where('age', '<=', ageGroup),
        ));
      }
    });
    return Promise.all(queries.map(getCountFromServer));
  }
}
