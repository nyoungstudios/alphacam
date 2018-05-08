import firebase from 'firebase';
import { fail } from 'assert';
class AuthController {
  constructor($scope, FirebaseService, $rootScope, $mdToast, $state) {
    this.name = 'auth';
    this.$mdToast = $mdToast;
    this.$scope = $scope;
    this.$state= $state;
    // console.log(firebase.auth());
    this.auth = FirebaseService.auth();

  }

  signin() {
    this.auth.$signInWithEmailAndPassword(this.$scope.email, this.$scope.password).then((firebaseUser) => {
      this.success(firebaseUser);

    }).catch((error) => {
      this.failed(error);
    });
  }

  signup() {
    this.auth.$createUserWithEmailAndPassword(this.$scope.email, this.$scope.password).then((firebaseUser) => {
      this.success(firebaseUser);
    }).catch((error) => {
      this.failed(error);
    });
  }


  success(firebaseUser) {
    this.showToast("Hello " + firebaseUser.email);
    console.log("Signed in as:", firebaseUser.uid);
    this.$state.go('home');
  }

  failed(error) {
    this.showToast(error);
    console.error("Authentication failed:", error);
  }

  showToast(msg) {
    this.$mdToast.show(
      this.$mdToast.simple()
      .textContent(msg)
      .position('top right')
      .hideDelay(3000)
    );
  }
}
AuthController.$inject = ['$scope', 'FirebaseService', '$rootScope', '$mdToast', '$state'];
export default AuthController;
