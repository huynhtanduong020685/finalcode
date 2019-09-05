import { Component } from '@angular/core';
import { NavController, ModalController, AlertController, App } from 'ionic-angular';
import { GlobalVariables } from '../../global/global_variable';
import { AppProvider } from '../../providers/app/app';
import { UtilProvider } from '../../providers/util/util';
import { Platform } from 'ionic-angular/platform/platform';
import { ChatsPage } from '../chats/chats';
import { LocalDetailPage } from '../local-detail/local-detail';
import { PopupPage } from '../popup/popup';
import { Storage } from '@ionic/storage';
import { LoginPage } from '../login/login';
import { HttpClient } from '@angular/common/http';
import { AngularFirestore } from '@angular/fire/firestore';
import { OneSignal } from '@ionic-native/onesignal';


declare var cordova;
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  limituser: number;
  country: string = '';
  language: string = '';
  user = GlobalVariables.user;
  localList: Array<any> = [];
  lastVisible: any;
  countryCount: number = 0;
  checkClick: boolean;
  checkClickLang: boolean;

  itemsOnlyCountry: any;
  itemsCountry: any;
  itemsLang: any;
  filtCountry: any;
  filtCity: any;
  filtLang: any;
  searchCountry: string = '';
  constructor(
    public app: App,
    public alertCtrl: AlertController,
    private storage: Storage,
    public navCtrl: NavController,
    private appProvider: AppProvider,
    private util: UtilProvider,
    private platform: Platform,
    public modalCtrl: ModalController,
    public http: HttpClient,
    public db: AngularFirestore,
    public oneSignal: OneSignal,
  ) {
    this.loadCountryJSON();
    this.filtCountry = [];
    this.filtCity = [];
    this.checkClick = true;
    this.checkClickLang = true;
  }

  ionViewWillEnter() {
    this.limituser = 20;
    this.localList = [];
    this.lastVisible = '';
    this.appProvider.getData(this.limituser).then(x => {
      x.forEach(element => {
        this.localList.push(element.data());
      });
      this.lastVisible = x.docs[x.docs.length - 1];
    })
    this.updatePlayerID();
  }
  //++++++++++++++++++++++++++ Start Set user = playerID +++++++++++++++++++++++++++
  updatePlayerID() {
    if (GlobalVariables.user['base64']) {
      this.oneSignal.endInit();
      this.oneSignal.getIds().then((id) => {
        this.user['playerID'] = id.userId;
        this.db.collection<any>('users').doc(this.user['base64']).update(this.user).then(res => {
          GlobalVariables.user = this.user;
          this.util.setLocal('user', this.user);
        })    
      });
    }
  }
  //++++++++++++++++++++++++++ End Set user = playerID +++++++++++++++++++++++++++
  filter() {
    if (this.searchCountry.length >= 3) {
      this.checkClick = false;
      this.filtCountry = this.itemsOnlyCountry.filter(item => item.country.toLowerCase().indexOf(this.searchCountry.toLowerCase()) > -1).map(i => i);
      this.filtCity = this.itemsCountry.filter(item => (item.city || '').toLowerCase().indexOf(this.searchCountry.toLowerCase()) > -1);
    } else {
      this.filtCountry = [];
      this.filtCity = [];
      this.checkClick = true;
    }
  }
  filterLang() {
    if (this.language.length >= 2) {
      this.checkClickLang = false;
      this.filtLang = this.itemsLang.filter(item => item.lang_name.toLowerCase().indexOf(this.language.toLowerCase()) > -1);
    } else {
      this.filtLang = [];
      this.checkClickLang = true;
    }
  }
  itemSelect(select) {
    this.checkClick = true;
    this.searchCountry = select.country;
    this.searchLocal();
  }
  itemSelectLang(select) {
    this.checkClickLang = true;
    this.language = select.lang_name;
    this.searchLocal();
  }

  loadCountryJSON() {

    this.http
      .get('assets/onlycountry.json')
      .subscribe((data) => {
        this.itemsOnlyCountry = data;
      });
    this.http
      .get('assets/country.json')
      .subscribe((data) => {
        this.itemsCountry = data;
      });
    this.http
      .get('assets/lang_list.json')
      .subscribe((data) => {
        this.itemsLang = data;
      });
  }

  doInfinite(): Promise<any> {
    return new Promise((resolve) => {
      console.log(resolve);
      setTimeout(() => {
        var userNext = 10;
        this.limituser += userNext;
        this.appProvider.getData(this.limituser).then(x => {
          var next = this.db.collection('users').ref
            .where("typeMember", "==", 'true')
            .orderBy('name')
            .startAfter(this.lastVisible)
            .limit(userNext);
          next.get().then(a => {
            a.forEach(b => {
              this.localList.push(b.data());
              console.log(b.data());
            })
          })
          this.lastVisible = x.docs[x.docs.length - 1];
        })
        resolve();
      }, 500);
    })
  }


  searchLocal() {
    try {
      this.util.presentLoading();
      this.countryCount = 0;
      this.appProvider.searchLocal(this.searchCountry, this.language, this.limituser).then((res: any) => {
        this.localList = res;
        this.util.stopLoading();
      }).catch(er => {
      })
    } catch (error) {
    }
  }

  onSearchClearCountry() {
    this.country = '';
    this.util.presentLoading();
    this.appProvider.searchLocal(this.country, this.language, this.limituser).then((res: any) => {
      this.localList = res;
      this.util.stopLoading();
    })
  }
  onSearchClearLanguage() {
    this.language = '';
    this.util.presentLoading();
    this.appProvider.searchLocal(this.country, this.language, this.limituser).then((res: any) => {
      this.localList = res;
      this.util.stopLoading();
    })
  }

  viewDetail(user) {
    GlobalVariables.selectedUser = user;
    // this.events.publish('tab_changed_1');
    this.navCtrl.push(LocalDetailPage, { user: user, myUser: this.user })
  }

  openBrowser(fb_id) {
    if (this.platform.is('cordova')) {
      cordova.InAppBrowser.open('https://fb.com/' + fb_id, '_blank', 'location=yes');
    }
  }
  askLocals() {
    var selectedUser = this.localList.filter(item => item['checked'] == true);
    var listCheck = [];
    selectedUser.map(item => {
      listCheck.push(item);
    });
    this.storage.get('checkUser').then((val) => {
      if (val == true) {
        if (listCheck.length > 0) {
          const modal = this.modalCtrl.create(PopupPage, { device: listCheck, user: this.user });
          modal.present();
          modal.onDidDismiss(() => {
            this.localList.filter(item => item['checked'] = false)
          })
        }
      } else {
        this.showConfirm();
      }
    });
  }
  goToChat(user) {
    GlobalVariables.selectedUser = user;
    this.navCtrl.push(ChatsPage, { receiver: user, user: this.user });
  }
  showConfirm() {
    const confirm = this.alertCtrl.create({
      title: 'Login',
      message: 'Please login to continue !!!',
      buttons: [
        {
          text: 'Disagree',
          handler: () => {
          }
        },
        {
          text: 'Agree',
          handler: () => {
            this.app.getRootNav().push(LoginPage);
          }
        }
      ]
    });
    confirm.present();
  }
}
