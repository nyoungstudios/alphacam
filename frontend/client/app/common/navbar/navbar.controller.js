class NavbarController {
  constructor($mdSidenav, $mdToast, FirebaseService, $state, $scope) {
    this.name = 'navbar';
    this.$mdSidenav = $mdSidenav;
    this.$mdToast = $mdToast;
    this.$state = $state;
    this.auth = FirebaseService.auth();
    this.$scope = $scope;

    this.auth.$onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {

        $scope.showSignout = true;
      } else {

        $scope.showSignout = false;
      }
    });
  }
  toggle() {
    this.$mdSidenav("left").toggle();
  }
  signout() {
    this.$mdSidenav("left").toggle();
    this.$scope.showSignout = false;
    this.showToast("Signed Out");
    this.auth.$signOut();
    this.$state.go('auth');
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
NavbarController.$inject = ['$mdSidenav', '$mdToast', 'FirebaseService', '$state', '$scope'];
export default NavbarController;
