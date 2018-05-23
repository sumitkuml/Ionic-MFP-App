//import { HttpClient } from '@angular/common/http';

import { Injectable } from '@angular/core';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer';


/*
  Generated class for the MyWardDataProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class MyWardDataProvider {
	data: any = null;
	objectStorageAccess: any = null;

  constructor(private transfer: FileTransfer) {
    console.log('--> MyWardDataProvider constructor() called');
  }
   load() {
    console.log('--> MyWardDataProvider loading data from adapter ...');
    return new Promise((resolve, reject)  => {
      if (this.data) {
        // already loaded data
        return resolve(this.data);
      }
      // don't have the data yet
      let dataRequest = new WLResourceRequest("/adapters/MyWardData", WLResourceRequest.GET);
      dataRequest.send().then(
        (response) => {
          console.log('--> MyWardDataProvider loaded data from adapter\n', response);
          this.data = response.responseJSON;
          resolve(this.data);
        }, (failure) => {
          console.log('--> MyWardDataProvider failed to load data\n', JSON.stringify(failure));
          reject(failure);
        })
    });

}
 getObjectStorageAccess() {
    // console.log('--> MyWardDataProvider getting Object Storage AuthToken from adapter ...');
    return new Promise((resolve, reject) => {
      if (this.objectStorageAccess) {
        // already loaded data
        return resolve(this.objectStorageAccess);
      }
      let dataRequest = new WLResourceRequest("/adapters/MyWardData/objectStorage", WLResourceRequest.GET);
      dataRequest.send().then(
        (response) => {
          // console.log('--> MyWardDataProvider got Object Storage AuthToken from adapter ', response);
          this.objectStorageAccess = response.responseJSON;
          resolve(this.objectStorageAccess);
        }, (failure) => {
          console.log('--> MyWardDataProvider failed to get Object Storage AuthToken from adapter\n', JSON.stringify(failure));
          reject(failure);
        })
    });
 }
 uploadNewGrievance(grievance) {
    return new Promise( (resolve, reject) => {
      console.log('--> MyWardDataProvider: Uploading following new grievance to server ...\n' + JSON.stringify(grievance));
      let dataRequest = new WLResourceRequest("/adapters/MyWardData", WLResourceRequest.POST);
      dataRequest.setHeader("Content-Type","application/json");
      dataRequest.send(grievance).then(
        (response) => {
          console.log('--> MyWardDataProvider: Upload successful:\n', response);
          resolve(response)
        }, (failure) => {
          console.log('--> MyWardDataProvider: Upload failed:\n', failure);
          reject(failure)
        })
    });
  }

  uploadImage(fileName, filePath) {
    return new Promise( (resolve, reject) => {
      let serverUrl = this.objectStorageAccess.baseUrl + fileName;
      console.log('--> MyWardDataProvider: Uploading image (' + filePath + ') to server (' + serverUrl + ') ...');
      let options: FileUploadOptions = {
        fileKey: 'file',
        fileName: fileName,
        httpMethod: 'PUT',
        headers: {
          'Authorization': this.objectStorageAccess.authorizationHeader,
          'Content-Type': 'image/jpeg'
        }
      }
      let fileTransfer: FileTransferObject = this.transfer.create();
      fileTransfer.upload(filePath, serverUrl, options).then((data) => {
        // success
        console.log('--> MyWardDataProvider: Image upload successful:\n', data);
        resolve(data);
      }, (err) => {
        // error
        console.log('--> MyWardDataProvider: Image upload failed:\n', err);
        reject(err);
      })
    });
  }
 
}
