import { Component } from '@angular/core';
import { App, Platform, ToastController} from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { TabsPage } from '../pages/tabs/tabs';
import { AppProvider } from '../providers/app/app';
import { GlobalVariables } from '../global/global_variable';
import { AngularFirestoreCollection, AngularFirestore } from '@angular/fire/firestore';
import { UtilProvider } from '../providers/util/util';

import { OneSignal } from '@ionic-native/onesignal';

import { Storage } from '@ionic/storage';

import { ChatsPage } from '../pages/chats/chats';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage: any;
  countryList: Array<any> = [];
  itemsCollections: AngularFirestoreCollection<any>;
  signal_app_id: string = '54940e0d-ca0d-4087-8e3c-57a70c54a20e';
  firebase_id: string = '443594649686';

  constructor(private storage: Storage, platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen,
    private toastCtrl: ToastController,
    private app: App,
    // private nav: NavController,
    oneSignal: OneSignal,
    //private events: Events,
    private util: UtilProvider,
    private appProvider: AppProvider, private db: AngularFirestore) {

    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();

      /*++++++++++++++++++++++++++ Start Notification +++++++++++++++++++++++++++*/
      oneSignal.startInit(this.signal_app_id, this.firebase_id);
      oneSignal.inFocusDisplaying(oneSignal.OSInFocusDisplayOption.Notification);
      oneSignal.handleNotificationOpened().subscribe((jsonData) => {
        this.app.getRootNav().push(ChatsPage, { 
          receiver: jsonData.notification.payload.additionalData.dataReceiver, 
          user: GlobalVariables.user
        });
      });

      oneSignal.handleNotificationReceived().subscribe((res) => {
        console.log(res);
        let toast = this.toastCtrl.create({
          message: res.payload.title,
          duration: 3000,
          position: 'top'
        });
        toast.present();
      });
      oneSignal.endInit();

      /*++++++++++++++++++++++++++ End Notification +++++++++++++++++++++++++++++*/

      this.getCountryList().then(() => { });
      this.itemsCollections = this.db.collection('users');
      this.util.getLocal('user').then(user => {
        if (user) {
          this.itemsCollections.doc(btoa(user['email'])).get().subscribe(snap => {
            splashScreen.hide()
            if (snap.exists) {
              GlobalVariables.user = snap.data();
              var usr = snap.data();
              usr['online'] = true;
              this.itemsCollections.doc(GlobalVariables.user['base64']).update(usr).then(() => {
              });
              storage.set('checkUser', true);
              this.rootPage = TabsPage;
            }
            else {
              // this.rootPage = LoginPage;
              storage.set('checkUser', false);
              this.rootPage = TabsPage;
            }
          })
        } else {
          storage.set('checkUser', false);
          this.rootPage = TabsPage;
        }
      })
    });
  }
  getCountryList() {
    return new Promise(resolve => {
      this.appProvider.getContryList().subscribe((data: any) => {
        if (data) {
          this.countryList = data;
          GlobalVariables.countries = data;
        }
        resolve();
      }, err => resolve());
    })
  }
}
