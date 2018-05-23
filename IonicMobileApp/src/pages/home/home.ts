import { Component } from '@angular/core';
import { NavController, LoadingController } from 'ionic-angular';
import { ImgCacheService } from 'ng-imgcache';
import { MyWardDataProvider } from '../../providers/my-ward-data/my-ward-data';
import { ProblemDetailPage } from '../problem-detail/problem-detail';
import { ReportNewPage } from '../report-new/report-new';
import { AuthHandlerProvider } from '../../providers/auth-handler/auth-handler';
import { LoginPage } from '../login/login';
import { ProblemListPage } from '../problem-list/problem-list'



@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
	loader: any;
  grievances: any;
  objectStorageAccess: any;

  constructor(public navCtrl: NavController, public loadingCtrl: LoadingController,
    public myWardDataProvider: MyWardDataProvider, public imgCache: ImgCacheService,
	private authHandler:AuthHandlerProvider) {
		console.log('--> HomePage constructor() called');

  }
   ionViewDidLoad() {
    console.log('--> HomePage ionViewDidLoad() called');
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
  }
  // https://www.joshmorony.com/a-simple-guide-to-navigation-in-ionic-2/
  itemClick(grievance) {
    this.navCtrl.push(ProblemDetailPage, { grievance: grievance, baseUrl: this.objectStorageAccess.baseUrl });
  }
  reportNewProblem(){
    this.navCtrl.push(ReportNewPage);
  }
   refresh() {
    this.myWardDataProvider.data = null;
    this.loadData();
  }
  myProblems(){
    this.navCtrl.push(ProblemListPage);
  }
  ionViewWillEnter() {
    console.log('--> HomePage ionViewWillEnter() called');
    this.initAuthChallengeHandler();
  }

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
