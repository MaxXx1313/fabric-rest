/**
 * @class LoginController
 * @ngInject
 */
function LoginController($scope, UserService, $state, ConfigLoader, ApiService) {
  var ctl = this;

  ctl.config = null;
  ctl.inProgress = false;

  // ApiService.getConfig().then(function(config){
  //   ctl.config = config;
  // });

  ctl.signUp = function(user) {
    ctl.inProgress = true;
    return UserService.signUp(user)
      .then(function(){
        $state.go('app.query').then(()=>{
          ctl.inProgress = false;
        });
      })
      .catch(function(e){
        ctl.inProgress = false;
        // throw e;
      })
  };


  ctl.getOrgName = function() {
    return ConfigLoader.getOrgName();
  };

} // -


angular.module('nsd.controller.login', ['nsd.service.user'])
.controller('LoginController', LoginController);
