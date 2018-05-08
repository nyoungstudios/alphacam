import firebase from 'firebase';
class FirebaseService {
  constructor(
      $firebaseObject, $firebaseArray, $firebaseAuth, $firebaseStorage) {
    // firebase init
    var config = {
      apiKey: '****************************************',
      authDomain: 'alphacam-94bcc.firebaseapp.com',
      databaseURL: 'https://alphacam-94bcc.firebaseio.com',
      projectId: 'alphacam-94bcc',
      storageBucket: 'alphacam-94bcc.appspot.com',
      messagingSenderId: '************'
    };
    firebase.initializeApp(config);
    firebase.auth().useDeviceLanguage();
    this.array = $firebaseArray;
    this.auth = $firebaseAuth;
    this.obj = $firebaseObject;
    this.storage = $firebaseStorage;
  }
  getAuth() {
    return this.auth();
  }
  getLabs() {
    var ref = firebase.database().ref().child('labs');
    return this.array(ref);
  }
  getYoloStorage(fileName) {
    var storageRef = firebase.storage().ref(fileName);
    return this.storage(storageRef);
  }
  phoneNumbers(lab) {
    var ref = firebase.database().ref().child("phoneNumbers/"+lab.name);
    return this.array(ref);
  }
}

FirebaseService.$inject =
    ['$firebaseObject', '$firebaseArray', '$firebaseAuth', '$firebaseStorage'];
export default FirebaseService;
