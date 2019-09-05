import { Component} from '@angular/core';
import { NavController, NavParams ,Events} from 'ionic-angular';
import { AngularFireStorage } from '@angular/fire/storage';
import { AngularFirestoreCollection, AngularFirestore } from '@angular/fire/firestore';
import { GlobalVariables } from '../../global/global_variable';
import { UtilProvider } from '../../providers/util/util';
import { AppProvider } from '../../providers/app/app';

@Component({
  selector: 'page-homestay-view',
  templateUrl: 'homestay-view.html',
})
export class HomestayViewPage {
  private itemsCollection: AngularFirestoreCollection<any>;
  rating: number = 4;

  user: any = GlobalVariables.user;
  homeStay: any = {};
  reviews: Array<any> = [];
  comment: string = '';
  pictures: Array<any> = [];
  constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        private util: UtilProvider,
        public events:Events,
        private appProvider: AppProvider,
        private storage: AngularFireStorage, 
        private db: AngularFirestore
    ){
      events.subscribe('star-rating:changed', (starRating) => {
        console.log(starRating);
        this.rating = starRating;
      });
        this.homeStay = Object.assign({}, this.navParams.get('homestay'));
        if(this.homeStay['pictures']){
         this.pictures = this.homeStay['pictures'].split('|');
     }
  }
  uploadFile(event) {
    const file = event.target.files[0];
    const filePath = 'uploads/' + file['name'];
    const ref = this.storage.ref(filePath);
    const task = ref.put(file);
    task.then(res => {
      this.storage.ref(filePath).getDownloadURL().subscribe(data => {
        if (data) {
          this.homeStay['picture'] = data;
        }
      })
    })
  }

  ionViewDidLoad() {
    this.itemsCollection = this.db.collection<any>('homestays');
    console.log('ionViewDidLoad HomestayDetailPage');
    this.getHomestayReviews();
  }

  submitHomeStay() {
    this.util.presentLoading();
    var userRef = this.itemsCollection.doc(this.user['base64']);
    if (this.homeStay['id']) {
      userRef.collection("items").doc(this.homeStay['id']).update(this.homeStay).then((data) => {
        console.log(data);
        this.util.stopLoading();
      }, err => { this.util.stopLoading() });

    } else {
      userRef.collection("items").add(this.homeStay).then((data) => {
        console.log(data);
        this.util.stopLoading();
      }, err => { this.util.stopLoading() });

    }

  }
  getHomestayReviews(){
    this.appProvider.getHomestayReviews(this.homeStay).then((data:any)=>{
        this.reviews = data;
    })
  }

  addReview(){
    if(this.comment!=''){
      this.util.presentLoading();
      this.appProvider.addReview(this.user, this.homeStay, this.comment).then(()=>{
        this.util.stopLoading();
        this.getHomestayReviews();
      })
    }else{
      this.util.showAlert('Notice', 'Please input your review first!');
    }
  }
}
