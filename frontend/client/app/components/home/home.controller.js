import detailImageTmpl from './detailImage.tmpl.html';
import phone from './phone.tmpl.html';
import shareTmpl from './share.tmpl.html';

class phoneController {
  constructor($rootScope, $scope, $mdDialog) {
    this.user = $rootScope.firebaseUser;
    this.$scope = $scope;
    this.$mdDialog = $mdDialog;
    $scope.phone = '';
    $scope.submitPhone = this.submitPhone.bind(this);
  }

  submitPhone() {
    // You also need to provide a button element signInButtonElement
    // which the user would click to complete sign-in.
    // Get recaptcha token. Let's use invisible recaptcha and hook to the
    // button.
    window.recapVeri = new firebase.auth.RecaptchaVerifier('recaptcha');
    console.log(1)
    // This will wait for the button to be clicked the reCAPTCHA resolved.
    return this.user
        .linkWithPhoneNumber('+1 ' + this.$scope.phone, window.recapVeri)
        .then((confirmationResult) => {
          // Ask user to provide the SMS code.
          var code = window.prompt('Provide your SMS code');
          // Complete sign-in.
          return confirmationResult.confirm(code)
              .then(() => {
                this.$mdDialog.cancel();
              })
              .catch((error) => {
                this.$scope.error = error;
              });
        })
        .catch((error) => {
          this.$scope.error = error;
        });
  }
}



class detailImageViewController {
  constructor($rootScope, $scope, FirebaseService) {
    $scope.detailUrl = $rootScope.detailUrl;

    FirebaseService.getYoloStorage($rootScope.yoloFile)
        .$getDownloadURL()
        .then((url) => {
          $scope.detailUrl = url;
        })
  }
}

class shareController {
  constructor($scope, Socialshare, $rootScope) {
    this.$scope = $scope;
    this.Socialshare = Socialshare;
    this.$rootScope = $rootScope;

    $scope.share = this.share.bind(this);

    $scope.items = [
      {name: 'linkedin', icon: 'fab fa-linkedin'},
      {name: 'reddit', icon: 'fab fa-reddit'},
      {name: 'weibo', icon: 'fab fa-weibo'},
      {name: 'facebook', icon: 'fab fa-facebook'},
      {name: 'twitter', icon: 'fab fa-twitter'},
    ];
  }

  share(item) {
    var str = 'Alphacam, the best lab web cam app ever. Detailed lab info at ' +
        this.$rootScope.shareUrl;
    this.Socialshare.share({
      'provider': item.name,
      'attrs': {
        'socialshareUrl': 'alphacam.doudoujay.com',
        'socialshareText': str
      }
    });
  }
}

class HomeController {
  constructor(
      $scope, FirebaseService, $mdDialog, $rootScope, $window, $mdBottomSheet,
      $mdToast, $http) {
    this.$scope = $scope;
    this.name = 'home';
    this.$mdDialog = $mdDialog;
    this.$rootScope = $rootScope;
    this.$window = $window;
    this.$mdBottomSheet = $mdBottomSheet;
    this.fabOpen = false;
    this.FirebaseService = FirebaseService;
    this.$mdToast = $mdToast;
    this.$http = $http;


    $scope.imgUrl = this.imgUrl;
    $scope.hasGPU = this.hasGPU;
    $scope.gpuInfo = this.gpuInfo;

    $scope.detailImageView = this.detailImageView.bind(this);
    FirebaseService.getLabs().$loaded().then((labs) => {
      $scope.labs = labs;
      this.getYoloImage();
      // this.loadNotify();
    });

    var auth = FirebaseService.auth();
    auth.$onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        if (!firebaseUser.phoneNumber) {
          // console.log("1111");
          $rootScope.firebaseUser = firebaseUser;
          $mdDialog
              .show({
                controller: phoneController,
                template: phone,
                parent: angular.element(document.body),
                clickOutsideToClose: true,
                fullscreen: false  // Only for -xs, -sm breakpoints.
              })
              .then(
                  function(answer) {

                  },
                  function() {

                  });

        } else {
          $scope.firebaseUser = firebaseUser;
        }
      }
    })
  }
  osStyle(lab) {
    if (lab.os.includes('Linux')) {
      return 'fa-linux';
    } else if (lab.os.includes('Windows')) {
      return 'fa-windows';
    }
  }

  imgUrl(lab) {
    if (lab.img == null) {
      return 'http://via.placeholder.com/200x200';
    } else {
      return lab.img;
    }
  }

  hasGPU(lab) {
    return lab.gpu != 'none' ? true : false
  }
  gpuInfo(lab) {
    var digits = lab.gpu.match(/\d/g);
    var numb = digits.join('');
    return 'GTX ' + numb;
  }

  detailImageView(lab) {
    console.log(lab);
    this.$rootScope.detailUrl = lab.img;
    this.$rootScope.yoloFile = lab.yoloFile;
    this.$mdDialog
        .show({
          controller: detailImageViewController,
          template: detailImageTmpl,
          parent: angular.element(document.body),
          clickOutsideToClose: true,
          fullscreen: false  // Only for -xs, -sm breakpoints.
        })
        .then(
            function(answer) {

            },
            function() {

            });
  }

  share(lab) {
    this.$rootScope.shareUrl =
        'https://www.cs.purdue.edu/resources/facilities/' +
        lab.name.toLowerCase() + '.html';
    this.$mdBottomSheet
        .show({
          template: shareTmpl,
          controller: shareController,
          clickOutsideToClose: true
        })
        .then(function(clickedItem) {

        })
        .catch(function(error) {
          // User clicked outside or hit escape
        });
  }

  detailLab(lab) {
    var url = 'https://www.cs.purdue.edu/resources/facilities/' +
        lab.name.toLowerCase() + '.html';
    this.$window.open(url, '_blank');
  }

  getYoloImage() {
    var i;
    this.$scope.yoloLabs = [];
    for (i in this.$scope.labs) {
      this.$scope.i = i;
      var labImg = this.$scope.labs[i].img;
      if (labImg == null) {
        continue;
      }
      // console.log(labImg);
      var fileName = labImg.substr(labImg.lastIndexOf('/') + 1);
      this.$scope.labs[i].yoloFile = fileName;

      // console.log(this.$scope.labs[i].yoloFile);
      // console.log(this.$scope.yoloLabs)
      // console.log(this.$scope.labs);
    }
  }

  loadNotify() {
    for (var j in this.$scope.labs) {
      if (this.$scope.labs[j] === null) {
        continue;
      }
      this.FirebaseService.phoneNumbers(this.$scope.labs[j])
          .$loaded()
          .then((phoneNumbers) => {
            for (var i in phoneNumbers) {
              if (phoneNumbers[i].$value ===
                  this.$scope.firebaseUser.phoneNumber) {
                this.$scope.labs[j].notifyStyle = 'fas fa-bell';
              }
            }

            if (this.$scope.labs[j].notifyStyle == null) {
              this.$scope.labs[j].notifyStyle = 'far fa-bell';
            }

            console.log(this.$scope.labs[j]);
          });
    }
  }



  notify(lab) {
    this.$http({
          url: 'https://alphacam.herokuapp.com/notify?lab=' + lab.name +
              '&number=' + this.$scope.firebaseUser.phoneNumber,
          method: 'GET',
          crossDomain: true,
        })
        .then(
            (response) => {

              alert(response.data);
            },
            (response) => {
              alert(response.data);
            })
  }
}

shareController.$inject = ['$scope', 'Socialshare', '$rootScope'];
detailImageViewController.$inject = ['$rootScope', '$scope', 'FirebaseService'];
phoneController.$inject = ['$rootScope', '$scope', '$mdDialog'];
HomeController.$inject = [
  '$scope', 'FirebaseService', '$mdDialog', '$rootScope', '$window',
  '$mdBottomSheet', '$mdToast', '$http'
];
export default HomeController;
