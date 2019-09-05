import { HttpClient } from '@angular/common/http';
import { Http, Headers, RequestOptions } from '@angular/http';
import { Injectable } from '@angular/core';
import { AngularFirestoreCollection, AngularFirestore } from '@angular/fire/firestore';

import { FilterByPipe } from '../../pipes/filter-by/filter-by';
//import { GlobalVariables } from '../../global/global_variable';
//import { AutoCompleteService } from 'ionic2-auto-complete';
import { map } from 'rxjs/operators';


@Injectable()
/*export class AppProvider implements AutoCompleteService {*/
export class AppProvider {


  localCollections: AngularFirestoreCollection<any>;
  homestayCollections: AngularFirestoreCollection<any>;
  chatCollections: AngularFirestoreCollection<any>;
  chatHistoryCollections: AngularFirestoreCollection<any>;
  reviewCollections: AngularFirestoreCollection<any>;
  constructor(
    public http: HttpClient,
    public db: AngularFirestore,
    public https: Http
  ) {
    this.localCollections = this.db.collection<any>('users');
    this.homestayCollections = this.db.collection<any>('homestays');
    this.chatCollections = this.db.collection<any>('chats');
    this.chatHistoryCollections = this.db.collection<any>('chatHistory');
    this.reviewCollections = this.db.collection<any>('reviews');
  }


  getResults(keyword) {
    return this.http.get("https://restcountries.eu/rest/v1/name/" + keyword).pipe(map(
      (result: any) => {
        return result.filter(item => item.name.toLowerCase().startsWith(keyword.toLowerCase())).map(i => i.name);
      })
    )
  }

  getContryList() {
    return this.http.get('https://restcountries.eu/rest/v2/all');
  }

  searchLocal(country, language, numberLimit) {
    return new Promise(resolve => {
      var rs = [];
      var filterBy = new FilterByPipe();
      this.localCollections.ref.limit(numberLimit).orderBy('name').get().then(snap => {
        snap.forEach(doc => {
          var docData = doc.data();
          docData['country'] = docData['country'] || '';
          docData['languages'] = `${docData['language1']},${docData['language2']},${docData['language3']},${docData['language4']}`;
          rs.push(docData);
        })
        var filter = filterBy.transform(rs, {
          country: country,
          languages: language
        });

        resolve(filter);
      }).catch(err => console.log(err))
    }).catch(err => {
    })
  }

  getData(numberLimit) {
    var user = this.db.collection('users');
    var firstPage = user.ref
      .where("typeMember", "==", 'true')
      .orderBy('name')
      .limit(numberLimit)
    return firstPage.get();
  }

  addReview(user, homestay, review) {
    return this.reviewCollections.doc(homestay['id']).collection('items').add({
      name: user['name'],
      picture: user['picture'],
      review: review
    })
  }
  getHomestayReviews(homestay) {
    return new Promise(resolve => {
      let rs = [];
      this.reviewCollections.doc(homestay['id']).collection('items').get().subscribe(snap => {
        snap.forEach(doc => {
          var docData = doc.data();
          docData['id'] = doc.id;
          rs.push(docData);
        })
        resolve(rs);
      }, err => resolve([]));
    });

  }

  getChatList(id1, id2) {
    var chatId = '';
    if (id1 < id2) {
      chatId = id1 + id2;
    } else {
      chatId = id2 + id1;
    }
    return new Promise(resolve => {
      let rs = [];
      this.chatCollections.doc(chatId).collection('items', ref => ref.orderBy('date')).get().subscribe(snap => {
        snap.forEach(doc => {
          var docData = doc.data();
          docData['id'] = doc.id;
          rs.push(docData);
        })
        resolve(rs);
      }, err => resolve(rs))
    });
  }

  addChageHistory(userId, partner) {
    return this.chatHistoryCollections.doc(userId['base64']).collection('items').doc(partner['base64']).set(partner);
  }

  getChatHistory(userID) {
    return new Promise(resolve => {
      let rs = [];
      this.chatHistoryCollections.doc(userID).collection('items').get().subscribe(snap => {
        snap.forEach(doc => {
          var docData = doc.data();
          docData['id'] = doc.id;
          rs.push(docData);
        })
        resolve(rs);
      }, err => resolve())
    })
  }
  submitChat(id1, id2, message, myInfo, targetid) {
    var chatId = '';
    if (id1 < id2) {
      chatId = id1 + id2;
    } else {
      chatId = id2 + id1;
    }
    return this.chatCollections.doc(chatId).collection('chats').add({
      sender: id1,
      receiver: id2,
      message: message,
      date: new Date().getTime()
    }).then(() => {
      let headers = new Headers(
        {
          'Content-Type': 'application/json'
        });
      let options = new RequestOptions({ headers: headers });

      let data = JSON.stringify({
        app_id: "54940e0d-ca0d-4087-8e3c-57a70c54a20e",
        include_player_ids: [targetid],
        headings: { en: "You have a message from " + myInfo['name'] },
        contents: { en: message },
        data: { dataReceiver: myInfo },

      });

      return new Promise((resolve, reject) => {
        this.https.post('https://onesignal.com/api/v1/notifications', data, options)
          .toPromise()
          .then((response) => {
            console.log('API Response : ', response.json());
            resolve(response.json());
          })
          .catch((error) => {
            console.error('API Error : ', error.status);
            console.error('API Error : ', JSON.stringify(error));
            reject(error.json());
          });
      });
    })
  }

  getOnlineUsers() {
    return new Promise(resolve => {
      let rs = [];
      this.localCollections.get().subscribe(snap => {
        snap.forEach(doc => {
          var docData = doc.data();
          docData['id'] = doc.id;
          if (docData['online'] == true) {
            rs.push(docData);
          }
        })
        resolve(rs);
      }, err => resolve())
    })
  }
}
