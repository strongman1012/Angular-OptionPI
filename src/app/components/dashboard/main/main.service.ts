import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { HttpErrorHandler, HandleError } from 'src/app/common/http-error-handler.service';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/compat/firestore';
import { CollectionReference, collectionGroup } from '@angular/fire/firestore';

import { ConfigService } from 'src/app/common/config.service';
// import { Login } from 'src/app/interface/login';
// import { ApiToken } from 'src/app/interface/api-token';
// import { FirebaseToken } from 'src/app/interface/firebase-token';


@Injectable({
  providedIn: 'root'
})
export class MainService {
  private baseUrl = '';
  private serverApiKey = '';

  constructor(
    private http: HttpClient,
    httpErrorHandler: HttpErrorHandler,
    private firestore: AngularFirestore,
    private configService: ConfigService) {
  }

  getMainTab(collectionName: string){
    let data;
    //this.firestore.collection(collectionName).doc('accountBalance').listCollection().then((data) => { console.log(data) });
    // this.firestore.collection(collectionName).doc('accountBalance').collection('50979182').doc('stock').ref.get().then(function(doc) {
    //   if (doc.exists) {
    //       data = doc.data();
    //       console.log("Document data:", doc.data());   // first console
    //   } else {
    //       console.log("No such document!");
    //   }
    // }).catch(function(error) {
    //     console.log("Error getting document:", error);
    // });
    // console.log("Service Data :: " + data); //second console
  }

  getMainTab1(collectionName: string){
    //return this.firestore.collection(uid).ref.get();
    return this.firestore.collection(collectionName);
    //return this.firestore.collection('tigeropenapidemo/'+uid);
  }

}