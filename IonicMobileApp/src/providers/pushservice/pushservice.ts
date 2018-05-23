/// <reference path="../../../plugins/cordova-plugin-mfp-push/typings/mfppush.d.ts" />
import { Injectable } from '@angular/core';

/*
  Generated class for the PushserviceProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class PushserviceProvider {

  constructor() {
    console.log('Hello PushserviceProvider Provider');
    
  }
  load(){
    MFPPush.initialize (
      function(successResponse) {
          console.log('--> push init success');
          MFPPush.registerNotificationsCallback(notificationReceived);
          MFPPush.registerDevice(null,
            function(successResponse) {
               console.log('Successfully registered');
               var tag=['messenger'];
               MFPPush.subscribe(
                tag,
                function(success) {
                    console.log('Subscribed successfully');
                },
                function(faliure) {
                    console.log("--> push subscribe fail");
                })
            },
            function(failure) {
                console.log('Failed to register');
            }
          )
        },
      function(failureResponse) {
          console.log('Failed to initialize');
      }
    )
  function notificationReceived(message)
  {
    alert(message.alert);
  }

  }

}
