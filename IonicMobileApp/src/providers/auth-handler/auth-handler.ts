/// <reference path="../../../plugins/cordova-plugin-mfp/typings/worklight.d.ts" />
//import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

/*
  Generated class for the AuthHandlerProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class AuthHandlerProvider {
  securityCheckName = 'UserLogin';
  securityCheckNamefb='socialLogin';
  //securityCheckName = 'SocialLoginSecurityCheck';
  userLoginChallengeHandler;
  socialLoginChallengeHandler;

  //challenge handler for fb login
 // userFbLoginChallengeHandler;
  initialized = false;
  username = null;

  isChallenged = false;
  handleChallengeCallback = null;
  loginSuccessCallback = null;
  loginFailureCallback = null;

  constructor() {
    //console.log('Hello AuthHandlerProvider Provider');
    console.log('--> AuthHandlerProvider constructor() called');
  }
  // Reference: https://mobilefirstplatform.ibmcloud.com/tutorials/en/foundation/8.0/authentication-and-security/credentials-validation/javascript/
  init() {
    if (this.initialized) {
      return;
    }
    this.initialized = true;
    console.log(-'-> AuthHandler init() called');
    this.userLoginChallengeHandler = WL.Client.createSecurityCheckChallengeHandler(this.securityCheckName);
    //this.socialLoginChallengeHandler = WL.Client.createSecurityCheckChallengeHandler(this.securityCheckNamefb);
    // https://stackoverflow.com/questions/20279484/how-to-access-the-correct-this-inside-a-callback
    this.userLoginChallengeHandler.handleChallenge = this.handleChallenge.bind(this);
    this.userLoginChallengeHandler.handleSuccess = this.handleSuccess.bind(this);
    this.userLoginChallengeHandler.handleFailure = this.handleFailure.bind(this);
    //For socialLogin challenge handler
    this.socialLoginChallengeHandler = WL.Client.createSecurityCheckChallengeHandler(this.securityCheckNamefb);
    this.socialLoginChallengeHandler.handleChallenge = this.handleChallenge.bind(this);
    this.socialLoginChallengeHandler.handleSuccess = this.handleSuccess.bind(this);
    this.socialLoginChallengeHandler.handleFailure = this.handleFailure.bind(this);
  }

  setHandleChallengeCallback(onHandleChallenge) {
    console.log('--> AuthHandler setHandleChallengeCallback() called');
    this.handleChallengeCallback = onHandleChallenge;
  }

  setLoginSuccessCallback(onSuccess) {
    console.log('--> AuthHandler setLoginSuccessCallback() called');
    this.loginSuccessCallback = onSuccess;
  }

  setLoginFailureCallback(onFailure) {
    console.log('--> AuthHandler setLoginFailureCallback() called');
    this.loginFailureCallback = onFailure;
  }

  handleChallenge(challenge) {
    console.log('--> AuthHandler handleChallenge called.\n', JSON.stringify(challenge));
    this.isChallenged = true;
    if (challenge.errorMsg !== null && this.loginFailureCallback != null) {
      var statusMsg = 'Remaining attempts = ' + challenge.remainingAttempts + '' + challenge.errorMsg;
      this.loginFailureCallback(statusMsg);
    } else if (this.handleChallengeCallback != null) {
      this.handleChallengeCallback();
    } else {
      console.log('--> AuthHandler: handleChallengeCallback not set!');
    }
  }

  handleSuccess(data) {
    console.log('--> AuthHandler handleSuccess called');
    this.isChallenged = false;
    if (this.loginSuccessCallback != null) {
      this.loginSuccessCallback();
    } else {
      console.log('--> AuthHandler: loginSuccessCallback not set!');
    }
  }

  handleFailure(error) {
    console.log('--> AuthHandler handleFailure called.\n' + JSON.stringify(error));
    this.isChallenged = false;
    if (this.loginFailureCallback != null) {
      this.loginFailureCallback(error.failure);
    } else {
      console.log('--> AuthHandler: loginFailureCallback not set!');
    }
  }

  // Reference: https://mobilefirstplatform.ibmcloud.com/tutorials/en/foundation/8.0/authentication-and-security/user-authentication/javascript/
  checkIsLoggedIn() {
    console.log('--> AuthHandler checkIsLoggedIn called');
    WLAuthorizationManager.obtainAccessToken(this.securityCheckName)
      .then(
      (accessToken) => {
        console.log('--> AuthHandler: obtainAccessToken onSuccess');
      },
      (error) => {
        console.log('--> AuthHandler: obtainAccessToken onFailure: ' + JSON.stringify(error));
      }
      );
     WLAuthorizationManager.obtainAccessToken('socialLogin')
      .then(
      (accessToken) => {
        console.log('--> AuthHandler: obtainAccessToken onSuccess');
      },
      (error) => {
        console.log('--> AuthHandler: obtainAccessToken onFailure: ' + JSON.stringify(error));
      }
      );
  }
  
  login(username, password) {
    console.log('--> AuthHandler login called. isChallenged = ', this.isChallenged);
    this.username = username;
    if (this.isChallenged) {
      this.userLoginChallengeHandler.submitChallengeAnswer({ 'username': username, 'password': password });
    } else {
      // https://stackoverflow.com/questions/20279484/how-to-access-the-correct-this-inside-a-callback
      var self = this;
      WLAuthorizationManager.login(this.securityCheckName, { 'username': username, 'password': password })
        .then(
        (success) => {
          console.log('--> AuthHandler: login success');
        },
        (failure) => {
          console.log('--> AuthHandler: login failure: ' + JSON.stringify(failure));
          self.loginFailureCallback(failure.errorMsg);
        }
        );
    }
  }
  //facebook login
  loginWithFb(accessToken){
    console.log('--> AuthHandler loginwithfb called ');
    var credentials = { 'token': accessToken, 'vendor': 'facebook' };
    if (this.isChallenged) {
      this.userLoginChallengeHandler.submitChallengeAnswer(credentials);
    } else {
      // https://stackoverflow.com/questions/20279484/how-to-access-the-correct-this-inside-a-callback
      var self = this;
      WLAuthorizationManager.login(this.securityCheckNamefb, credentials)
        .then(
        (success) => {
          console.log('--> AuthHandler: login success');
        },
        (failure) => {
          console.log('--> AuthHandler: login failure: ' + JSON.stringify(failure));
          self.loginFailureCallback(failure.errorMsg);
        }
        );
    }
  }

  logout() {
    console.log('--> AuthHandler logout called');
    WLAuthorizationManager.logout(this.securityCheckNamefb)
      .then(
      (success) => {
        console.log('--> AuthHandler: logout success');
      },
      (failure) => {
        console.log('--> AuthHandler: logout failure: ' + JSON.stringify(failure));
      }
      );
  }
}
