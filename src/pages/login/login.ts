import { Component, NgZone } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { UtilProvider } from '../../providers/util/util';
import firebase from 'firebase/app';
import { AngularFireAuth } from '@angular/fire/auth';
import { TabsPage } from '../tabs/tabs';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { GlobalVariables } from '../../global/global_variable';
import { AppProvider } from '../../providers/app/app';
import { SelectCountryComponent } from '../../components/select-country/select-country';

import { Storage } from '@ionic/storage';

declare var facebookConnectPlugin;

@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {
  private itemsCollection: AngularFirestoreCollection<any>;
  countries: Array<any> = [];
  country: string = null;
  constructor(private storage: Storage, public navCtrl: NavController, public navParams: NavParams, private util: UtilProvider,
    private db: AngularFirestore,
    private zone: NgZone,
    private appProvider: AppProvider,
    private af_auth: AngularFireAuth, ) {
  }

  ionViewDidLoad() {
    this.itemsCollection = this.db.collection<any>('users');
    this.util.presentLoading();
    this.getCountryList().then(() => {
      this.util.stopLoading();
    });
  }

  getCountryList() {
    return new Promise(resolve => {
      this.appProvider.getContryList().subscribe((data: any) => {
        if (data) {
          this.countries = data;
          GlobalVariables.countries = data;
        }
        resolve();
      }, err => resolve());
    })

  }
  facebookLogin() {
    let TimeCreate = Date.now();
    facebookConnectPlugin.login(["public_profile", "email"], obj => {
      this.util.presentLoading();
      const facebookCredential = firebase.auth.FacebookAuthProvider
        .credential(obj.authResponse.accessToken);
      this.af_auth.auth.signInWithCredential(facebookCredential).then(res => {
        var data = res.toJSON();
        console.log(res.toJSON());
        
        let user: any = {};
        user['email'] = data['email'];
        user['name'] = data['displayName'];
        user['picture'] = data['photoURL'];
        user['base64'] = btoa(user['email']);//data['uid'];
        user['fb_id'] = data['providerData'][0]['uid'];
        user['online'] = true;
        user['typeMember'] = 'false';
        user['guide_fee'] = 'Free';
        user['TimeCreate'] = TimeCreate;
        
        GlobalVariables.user = user;
        var docRef = this.itemsCollection.doc(user['base64']);
        docRef.get().subscribe(doc => {
          this.storage.set('checkUser', true);
          if (!doc.exists) {
            this.itemsCollection.doc(user['base64']).set(user).then(() => {
              this.util.setLocal('user', user);
              this.storage.set('checkUser', true);
            });
          } else {
            GlobalVariables.user = doc.data();
            this.util.setLocal('user', doc.data());
            this.storage.set('checkUser', true);
          }

          this.util.stopLoading();
          if (GlobalVariables.user['country'] && GlobalVariables.user['country'] != '') {
            this.zone.run(() => {
              this.storage.set('checkUser', true);
              this.navCtrl.setRoot(TabsPage);
            });
          } else {
            this.util.showModal(SelectCountryComponent).then(data => {
              this.storage.set('checkUser', true);
            })
          }
        })
      }, err => {
      })
    }, fail => {
    })
  }
}
