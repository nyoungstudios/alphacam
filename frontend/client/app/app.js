import angular from 'angular';
import uiRouter from 'angular-ui-router';
import ngMaterial from 'angular-material';
import 'angular-socialshare';
// import firebase from "firebase";
import "angularfire";
import Common from './common/common';
import Components from './components/components';
import AppComponent from './app.component';
import FirebaseService from './services/FirebaseService';

import 'normalize.css';

import 'angular-material/angular-material.min.css';

 // firebase init
 var config = {
  apiKey: "**************************************",
  authDomain: "alphacam-94bcc.firebaseapp.com",
  databaseURL: "https://alphacam-94bcc.firebaseio.com",
  projectId: "alphacam-94bcc",
  storageBucket: "alphacam-94bcc.appspot.com",
  messagingSenderId: "************"
};
firebase.initializeApp(config);
firebase.auth().useDeviceLanguage();

var app = angular.module('app', [
    ngMaterial,
    uiRouter,
    'firebase',
    Common,
    Components,
    '720kb.socialshare'

  ])
  .config(($locationProvider) => {
    "ngInject";
    // @see: https://github.com/angular-ui/ui-router/wiki/Frequently-Asked-Questions
    // #how-to-configure-your-server-to-work-with-html5mode
    $locationProvider.html5Mode(true).hashPrefix('!');
  })
  .config(function () {


  })

  .service("FirebaseService", FirebaseService)

  .component('app', AppComponent);

app.config(function ($mdThemingProvider) {
  $mdThemingProvider
    .theme('default')
    .primaryPalette('orange')
    .accentPalette('yellow');
});
app.run(function ($rootScope, FirebaseService, $state, $timeout, $mdDialog) {
  var auth = FirebaseService.auth();



  // Listen to '$locationChangeSuccess', not '$stateChangeStart'
  $rootScope.$on('$locationChangeSuccess', (event) => {
    auth.$onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        console.log("Signed in as:", firebaseUser.uid);
      } else {
        event.preventDefault();
        $timeout(() => {
          $state.go('auth');
        });

      }

    })
  })
});
