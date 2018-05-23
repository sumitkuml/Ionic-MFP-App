import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { GoogleMaps, GoogleMap, GoogleMapsEvent, GoogleMapOptions, Marker, LatLng } from '@ionic-native/google-maps';
import { Geolocation } from '@ionic-native/geolocation';

/**
 * Generated class for the ProblemDetailPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

//@IonicPage()
@Component({
  selector: 'page-problem-detail',
  templateUrl: 'problem-detail.html',
})
export class ProblemDetailPage {
	grievance: any;
  baseUrl: any;
  map: GoogleMap;
  lat: any;
  lng: any;

  constructor(public navCtrl: NavController, public navParams: NavParams, public geolocation: Geolocation) {
	   console.log('--> ProblemDetailPage constructor() called');
    this.grievance = navParams.get('grievance');
    this.baseUrl = navParams.get('baseUrl');
  }

  ionViewDidLoad() {
   // console.log('ionViewDidLoad ProblemDetailPage');
   console.log('--> ProblemDetailPage ionViewDidLoad() called');
    this.loadMap();
  }
   loadMap() {
    let loc = new LatLng(this.grievance.geoLocation.coordinates[1], this.grievance.geoLocation.coordinates[0]);
    let mapOptions: GoogleMapOptions= {
      camera: {
        target: loc,
        zoom: 15,
        tilt: 10
      }
    };
    this.map = GoogleMaps.create('map', mapOptions);
    this.map.one(GoogleMapsEvent.MAP_READY).then(() => {
      this.map.addMarker({
        title: 'Problem Location',
        position: loc
      }).then((marker: Marker) => {
        marker.showInfoWindow();
      }).catch(err => {
        console.log(err);
      });
    });
    this.getLoc();
  }

  getLoc() {
    console.log('dis calc');
    this.geolocation.getCurrentPosition().then((resp) => {
    this.lat = (resp.coords.latitude);
    console.log('lat cur');
    console.log(this.lat);
    this.lng =(resp.coords.longitude);
    console.log(this.lng);
    this.callDist();
    //this.t=true;
    }).catch((error) => {
     console.log('Error getting location', error);
   });
} 

callDist(){
  console.log('calc distance is called');
  // if(this.t){
    let dist=this.calculateDistance(this.grievance.geoLocation.coordinates[1], this.lat, this.grievance.geoLocation.coordinates[0], this.lng);
    
    console.log('This is distance');
    console.log(dist);
}

calculateDistance(lat1:number,lat2:number,long1:number,long2:number){
    console.log('calc distance func is called');
    console.log(lat1);
    console.log(lat2);
    console.log(long1);
    console.log(long2);
    let p = 0.017453292519943295;    // Math.PI / 180
    let c = Math.cos;
    let a = 0.5 - c((lat1-lat2) * p) / 2 + c(lat2 * p) *c((lat1) * p) * (1 - c(((long1- long2) * p))) / 2;
    let dis = (12742 * Math.asin(Math.sqrt(a))); // 2 * R; R = 6371 km
    console.log((12742 * Math.asin(Math.sqrt(a))));
    return dis;
  }

}
