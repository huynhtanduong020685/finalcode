import { Component } from '@angular/core';
import { NavController, AlertController, App, ModalController } from 'ionic-angular';
import { GlobalVariables } from '../../global/global_variable';
import { EditProfilePage } from '../edit-profile/edit-profile';
import { HomestayDetailPage } from '../homestay-detail/homestay-detail';
import { NavParams } from 'ionic-angular/navigation/nav-params';
import { LoginPage } from '../login/login';
import { TabsPage } from '../tabs/tabs';

import { UtilProvider } from '../../providers/util/util';
import { Facebook } from '@ionic-native/facebook';

import { Storage } from '@ionic/storage';

@Component({
    selector: 'page-about',
    templateUrl: 'about.html'
})
export class AboutPage {
    public checkUser: boolean;
    user: any;
    localList: Array<any> = [];

    constructor(public app: App,
        public alertCtrl: AlertController,
        private storage: Storage,
        public navCtrl: NavController,
        public navParams: NavParams,
        public modalCtrl: ModalController,
        public fb: Facebook,
        private util: UtilProvider, ) {
    }

    ionViewWillEnter() {
        this.storage.get('checkUser').then((val) => {
            if (val == true) {
                this.checkUser = true;
                this.user = GlobalVariables.user;
                console.log(this.user);
            } else {
                this.checkUser = false;
                this.showConfirm();
            }
        });
    }

    editProfile() {
        this.navCtrl.push(EditProfilePage, { user: this.user });
    }
    logout() {
        this.util.clearLocal();
        this.fb.logout();
        this.storage.set('checkUser', false);
        GlobalVariables.user = '';
        this.app.getRootNav().push(TabsPage);
    }

    viewDetail(item) {
        this.navCtrl.push(HomestayDetailPage, { homestay: item });
    }
    showConfirm() {
        const confirm = this.alertCtrl.create({
            title: 'Login',
            message: 'Please login to continue !!!',
            buttons: [
                {
                    text: 'Disagree',
                    handler: () => {
                        // this.navCtrl.push(HomePage);
                        this.app.getRootNav().push(TabsPage);
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
