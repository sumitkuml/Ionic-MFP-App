import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { ImgCacheModule } from 'ng-imgcache';

import { MyApp } from './app.component';
import { LoginPage } from '../pages/login/login'
import { HomePage } from '../pages/home/home';
import { AuthHandlerProvider } from '../providers/auth-handler/auth-handler';
import { MyWardDataProvider } from '../providers/my-ward-data/my-ward-data';
import { GoogleMaps } from '@ionic-native/google-maps';
import { ProblemDetailPage } from '../pages/problem-detail/problem-detail';
import { Camera } from '@ionic-native/camera';
import { ImageResizer } from '@ionic-native/image-resizer';
import { FileTransfer } from '@ionic-native/file-transfer';
import { ReportNewPage } from '../pages/report-new/report-new';
import { Facebook } from '@ionic-native/facebook';
import { ProblemListPage } from '../pages/problem-list/problem-list';
import { SetRangePage } from '../pages/set-range/set-range';
import { Geolocation } from '@ionic-native/geolocation';
//import { PushServiceProvider } from '../providers/pushservice/pushservice';
import { PushserviceProvider } from '../providers/pushservice/pushservice';

@NgModule({
  declarations: [
    MyApp,
	LoginPage,
    HomePage,
   ProblemDetailPage,
   ProblemListPage,
   SetRangePage,
	 ReportNewPage
  ],
  imports: [
    BrowserModule,
	ImgCacheModule,
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
	  LoginPage,
    HomePage,
    ProblemListPage,
    SetRangePage,
	  ProblemDetailPage,
	  ReportNewPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    AuthHandlerProvider,
    MyWardDataProvider,
	GoogleMaps,
	Camera,
    ImageResizer,
    FileTransfer,
    Geolocation,
	 Facebook,
    AuthHandlerProvider,
    PushserviceProvider
  ]
})
export class AppModule {}
