import { Component } from '@angular/core';
import { IonicPage, NavController, AlertController, NavParams, ViewController } from 'ionic-angular';
import { GoogleMaps, GoogleMap, GoogleMapsEvent, GoogleMapOptions, Marker, LatLng, MyLocation, MarkerOptions, Spherical } from '@ionic-native/google-maps';
import { ProblemListPage } from '../problem-list/problem-list'



/**
 * Generated class for the SetRangePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-set-range',
  templateUrl: 'set-range.html',
})
export class SetRangePage {

  map: GoogleMap;
  mapReady: boolean = false;
  location: LatLng = null;
  range: any='';

  constructor(public navCtrl: NavController, public navParams: NavParams, private alertCtrl: AlertController, public viewCtrl: ViewController ) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SetRangePage');
    this.createMap();
  }

  createMap() {
    // TODO need to store/retrieve prevLoc in app preferences/local storage
    console.log('set Range called');
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
      //get current location
      this.captureLocation();
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
    //let rangeR: this.range;

    // Get the location of you
    this.map.getMyLocation().then((location: MyLocation) => {
      this.location = location.latLng;
      console.log('--> ReportNewPage: Device Location = ' + JSON.stringify(location, null, 2));
      // Move the map camera to the location with animation
      this.map.animateCamera({
        target: location.latLng,
        zoom: 14,
        tilt: 30
      }).then(() => {
        //add a circle
        console.log('Adding a circle');
        this.map.addCircle({
          'center': location.latLng,
          'radius': this.range,
          'strokeColor' : '#AA00FF',
          'strokeWidth': 5,
          'fillColor' : '#880000'
        });

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

  submit()
  {
    this.navCtrl.push(ProblemListPage, this.range );
   // this.viewCtrl.dismiss(this.range);
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



}
