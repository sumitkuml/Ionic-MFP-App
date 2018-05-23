import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, LoadingController, ToastController } from 'ionic-angular';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { GoogleMaps, GoogleMap, GoogleMapsEvent, GoogleMapOptions, Marker, LatLng, MyLocation } from '@ionic-native/google-maps';
import { ImageResizer, ImageResizerOptions } from '@ionic-native/image-resizer';
import { LoginPage } from '../login/login';

import { MyWardDataProvider } from '../../providers/my-ward-data/my-ward-data';
import { AuthHandlerProvider } from '../../providers/auth-handler/auth-handler';
/**
 * Generated class for the ReportNewPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

//@IonicPage()
@Component({
  selector: 'page-report-new',
  templateUrl: 'report-new.html',
})
export class ReportNewPage {
	capturedImage: string = null;
  mapReady: boolean = false;
  map: GoogleMap;
  description: string = '';
  address: string = '';
  location: LatLng = null;
  loader: any;


  constructor(public navCtrl: NavController, public navParams: NavParams,
  private camera: Camera, private alertCtrl: AlertController, private imageResizer: ImageResizer,
    private loadingCtrl: LoadingController, private toastCtrl: ToastController,
    private myWardDataProvider: MyWardDataProvider, private authHandler:AuthHandlerProvider) {
		console.log('--> ReportNewPage constructor() called');
  }

  ionViewDidLoad() {
    console.log('--> ReportNewPage ionViewDidLoad() called');
    this.createMap();
	this.initAuthChallengeHandler();
  }
   // https://ionicframework.com/docs/native/camera/
  takePhoto() {
    console.log('-->take photo function called');
    const options : CameraOptions = {
      quality: 90, // picture quality
      destinationType: this.camera.DestinationType.FILE_URI,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      correctOrientation: true
    }
    this.camera.getPicture(options) .then((imageData) => {
        // this.capturedImage = "data:image/jpeg;base64," + imageData;
        this.capturedImage = imageData;
      }, (err) => {
        console.log(err);
      }
    );
  }

  createMap() {
    // TODO need to store/retrieve prevLoc in app preferences/local storage
    let prevLoc = new LatLng(13.0768342, 77.7886087);
    let mapOptions: GoogleMapOptions = {
      camera: {
        target: prevLoc,
        zoom: 15,
        tilt: 10
      }
    };
    this.map = GoogleMaps.create('map', mapOptions);
    this.map.one(GoogleMapsEvent.MAP_READY).then(() => {
      console.log('--> ReportNewPage: Map is Ready To Use');
      this.mapReady = true;
      // https://stackoverflow.com/questions/4537164/google-maps-v3-set-single-marker-point-on-map-click
      this.map.on(GoogleMapsEvent.MAP_CLICK).subscribe( event => {
        this.location = event[0];
        console.log('--> ReportNewPage: User clicked location = ' + event[0]);
        this.map.clear();
        this.map.addMarker({
          title: 'Selected location',
          position: event[0]
        }).then((marker: Marker) => {
          marker.showInfoWindow();
        });
      });
    });
  }

  captureLocation() {
    if (!this.mapReady) {
      this.showAlert('Map is not yet ready', 'Map is not ready yet. Please try again.');
      return;
    }
    this.map.clear();

    // Get the location of you
    this.map.getMyLocation().then((location: MyLocation) => {
      this.location = location.latLng;
      console.log('--> ReportNewPage: Device Location = ' + JSON.stringify(location, null, 2));
      // Move the map camera to the location with animation
      this.map.animateCamera({
        target: location.latLng,
        zoom: 17,
        tilt: 30
      }).then(() => {
        // add a marker
        this.map.addMarker({
          title: 'Your device location',
          snippet: 'Accurate to ' + location.accuracy + ' meters!',
          position: location.latLng,
          animation: 'BOUNCE'
        }).then((marker: Marker) => {
          marker.showInfoWindow();
        });
      })
    }).catch(err => {
      this.showAlert('Try again', err.error_message);
      console.log(err);
    });
  }

  showAlert(alertTitle, alertMessage, enableBackdropDismiss: boolean = true, okHandler?) {
    let prompt = this.alertCtrl.create({
      title: alertTitle,
      message: alertMessage,
      buttons: [{
        text: 'Ok',
        handler: okHandler
      }],
      enableBackdropDismiss: enableBackdropDismiss
    });
    prompt.present();
  }

  showToast(message: string) {
    let toast = this.toastCtrl.create({
      message: message,
      duration: 2000,
      position: 'bottom'
    });
    toast.present(toast);
  }

  submit() {
    if (this.description === "") {
      this.showAlert('Missing Description', 'Please add a description for the problem you are reporting.');
      return;
    }
    if (this.address === "") {
      this.showAlert('Missing Address', 'Please specify the address of problem location.');
      return;
    }
    if (this.capturedImage === null) {
      this.showAlert('Missing Photo', 'Please take a photo of the problem location.');
      return;
    }
    if (this.location === null) {
      this.showAlert('Missing Geo Location', 'Please mark the location of problem on Maps.');
      return;
    }

    let username = this.authHandler.username;
    let timestamp = this.getDateTime();
    let imageFilename = timestamp + '_' + username + '.jpeg';
    let thumbnailImageFilename = 'thumbnail_' + imageFilename;
    let grievance = {
      "reportedBy": username,
      "reportedDateTime": timestamp,
      "picture": {
        "large": imageFilename,
        "thumbnail": thumbnailImageFilename
      },
      "problemDescription": this.description,
      "geoLocation": {
        "type": "Point",
        "coordinates": [
          this.location.lng,
          this.location.lat
        ]
      },
      "address": this.address
    }

    this.loader = this.loadingCtrl.create({
      content: 'Uploading data to server. Please wait ...',
      dismissOnPageChange: true
    });
    this.loader.present().then(() => {
      this.myWardDataProvider.uploadNewGrievance(grievance).then(
        (response) => {
          this.loader.dismiss();
          this.showToast('Data Uploaded Successfully');
          this.loader = this.loadingCtrl.create({
            content: 'Uploading image to server. Please wait ...',
            dismissOnPageChange: true
          });
          this.loader.present().then(() => {
            this.myWardDataProvider.uploadImage(imageFilename, this.capturedImage).then(
              (response) => {
                this.imageResizer.resize(this.getImageResizerOptions()).then(
                  (filePath: string) => {
                    this.myWardDataProvider.uploadImage(thumbnailImageFilename, filePath).then(
                      (response) => {
                        this.loader.dismiss();
                        this.showToast('Image Uploaded Successfully');
                        this.showAlert('Upload Successful', 'Successfully uploaded problem report to server', false, () => {
                          this.myWardDataProvider.data.push(grievance);
                          this.navCtrl.pop();
                        })
                      }, (failure) => {
                        this.loader.dismiss();
                        this.showAlert('Thumbnail Upload Failed', 'Encountered following error while uploading thumbnail image to server:\n' + failure.errorMsg);
                    });
                  }).catch(e => {
                    console.log(e)
                    this.showAlert('Error Creating Thumbnail', 'Encountered following error while creating thumbnail:\n' + JSON.stringify(e));
                  });
              }, (failure) => {
                this.loader.dismiss();
                this.showAlert('Image Upload Failed', 'Encountered following error while uploading image to server:\n' + failure.errorMsg);
              });
          });
        }, (failure) => {
          this.loader.dismiss();
          this.showAlert('Data Upload Failed', 'Encountered following error while uploading data to server:\n' + failure.errorMsg);
        });
    });
  }

  getImageResizerOptions() {
    let options = {
      uri: this.capturedImage,
      quality: 90,
      width: 400,
      height: 400
    } as ImageResizerOptions;
    return options;
  }

  getDateTime() {
    // https://stackoverflow.com/questions/10211145/getting-current-date-and-time-in-javascript
    let currentdate = new Date();
    let fullYear = currentdate.getFullYear();
    let month = (((currentdate.getMonth()+1) < 10)? "0" : "") + (currentdate.getMonth()+1);
    let date = ((currentdate.getDate() < 10)? "0" : "") + currentdate.getDate();
    let hours = ((currentdate.getHours() < 10)? "0" : "") + currentdate.getHours();
    let minutes = ((currentdate.getMinutes() < 10)? "0" : "") + currentdate.getMinutes();
    let seconds = ((currentdate.getSeconds() < 10)? "0" : "") + currentdate.getSeconds();
    let datetime = fullYear + month + date + "_" + hours + minutes + seconds;
    return datetime;
  } 
  initAuthChallengeHandler() {
    this.authHandler.setHandleChallengeCallback(() => {
      this.navCtrl.push(LoginPage, { isPushed: true, fixedUsername: this.authHandler.username });
    });
    this.authHandler.setLoginSuccessCallback(() => {
      let view = this.navCtrl.getActive();
      if (view.instance instanceof LoginPage) {
        this.navCtrl.pop().then(() =>{
          this.loader = this.loadingCtrl.create({
            content: 'Uploading data to server. Please wait ...'
          });
          this.loader.present();
        });
      }
    });
  }
  }
