import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams,  LoadingController, ModalController } from 'ionic-angular';
import { SetRangePage } from '../set-range/set-range';
import { MyWardDataProvider } from '../../providers/my-ward-data/my-ward-data';
import { AuthHandlerProvider } from '../../providers/auth-handler/auth-handler';
import { LoginPage } from '../login/login';
import { ImgCacheService } from 'ng-imgcache';
import { Geolocation } from '@ionic-native/geolocation';
import { ProblemDetailPage } from '../problem-detail/problem-detail';
import { GoogleMaps, GoogleMap, GoogleMapsEvent, GoogleMapOptions, Marker, LatLng } from '@ionic-native/google-maps';

/**
 * Generated class for the ProblemListPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-problem-list',
  templateUrl: 'problem-list.html',
})
export class ProblemListPage {
  loader: any;
  grievances: any;
  objectStorageAccess: any;
  location: LatLng= null;
  grievance: any;
  rad: any;
  map: GoogleMap;
  lat: any;
  lng: any;
  baseUrl: any;

  constructor(public navCtrl: NavController, public navParams: NavParams, public geolocation: Geolocation, public loadingCtrl: LoadingController, public myWardDataProvider: MyWardDataProvider, public modalCtrl: ModalController, public imgCache: ImgCacheService, private authHandler:AuthHandlerProvider) {
    this.grievance = navParams.get('grievance');
    this.baseUrl = navParams.get('baseUrl');
  }

  setRange() {
    this.navCtrl.push(SetRangePage);
   /* let modal=this.modalCtrl.create(SetRangePage);
    modal.onDidDismiss(rad => {
      console.log(this.rad);
    });
    modal.present();*/
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ProblemListPage');
    this.loadData();
 
  }

  loadData() {
    this.loader = this.loadingCtrl.create({
      content: 'Loading data. Please wait ...',
    });
    this.loader.present().then(() => {
      this.myWardDataProvider.load().then(data => {
		  this.myWardDataProvider.getObjectStorageAccess().then(objectStorageAccess => {
          this.objectStorageAccess = objectStorageAccess;
          this.imgCache.init({
            headers: {
              'Authorization': this.objectStorageAccess.authorizationHeader
            }
          }).then( () => {
            console.log('--> HomePage initialized imgCache');
            this.loader.dismiss();
            this.grievances = data;
          });
        });
       // this.loader.dismiss();
        //this.grievances = data;
      });
    });
  console.log('this is reported problem location');
 
 // console.log(this.grievance.geoLocation.coordinates[1]);
  //console.log(this.grievance.geoLocation.coordinates[0]);
}

itemClick(grievance) {
  //let loc = new LatLng(this.grievance.geoLocation.coordinates[1], this.grievance.geoLocation.coordinates[0]);
    //console.log(loc);
  this.navCtrl.push(ProblemDetailPage, { grievance: grievance, baseUrl: this.objectStorageAccess.baseUrl });
}

refresh() {
  this.myWardDataProvider.data = null;
  this.loadData();}

  initAuthChallengeHandler() {
    this.authHandler.setHandleChallengeCallback(() => {
      this.loader.dismiss();
      this.navCtrl.push(LoginPage, { isPushed: true });
    });
    this.authHandler.setLoginSuccessCallback(() => {
      let view = this.navCtrl.getActive();
      if (view.instance instanceof LoginPage) {
        this.navCtrl.pop().then(() =>{
          this.loader = this.loadingCtrl.create({
            content: 'Loading data. Please wait ...'
          });
          this.loader.present();
        });
      }
    });
  }

}
