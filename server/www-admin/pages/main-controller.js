/**
 * @class MainController
 * @ngInject
 */
function MainController($scope, UserService, $state, ConfigLoader, ApiService) {
  var ctrl = this;

  ctrl.$state = $state;

  ctrl.visibleMenuItem = function(state){
    return !(state.abstract || state.data && state.data.visible===false);
  }

  ctrl.authorized = function(){
    return UserService.isAuthorized();
  }

  ctrl.getUser = function(){
    return UserService.getUser();
  }

  ctrl.logout = function(){
    UserService.logout();

    // force re-check access rules
    // $state.go($state.current, $state.params, { notify: true });
    $state.go('app.login');
  }

  ctrl.getOrgName = function() {
    return ConfigLoader.getOrgName();
  };

  return ctrl;
}


angular.module('nsd.controller.main', [])
  .controller('MainController', MainController);
