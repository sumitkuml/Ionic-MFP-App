import { Component, Renderer  } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { LoginPage } from '../pages/login/login'
import { AuthHandlerProvider } from '../providers/auth-handler/auth-handler';
import { PushserviceProvider } from '../providers/pushservice/pushservice';

//import { HomePage } from '../pages/home/home';
@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage:any = LoginPage;
  //push:any;

  constructor(platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen,
  renderer: Renderer, private authHandler: AuthHandlerProvider, public push: PushserviceProvider) {
    console.log('--> MyApp constructor() called');

    renderer.listenGlobal('document', 'mfpjsloaded', () => {
      console.log('--> MyApp mfpjsloaded');
      this.authHandler.init();
      this.push.load();
      
    })
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
    console.log('--> MyApp platform.ready() called');
      statusBar.styleDefault();
      splashScreen.hide();
	  //setTimeout(() => {
       // splashScreen.hide();
     // }, 100);
    });
  }
}

