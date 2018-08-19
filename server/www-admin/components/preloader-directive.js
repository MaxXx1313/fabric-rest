
angular.module('nsd.directive.preloader', [])

// scope:
// = is for two-way binding
// @ simply reads the value (one-way binding)
// & is used to bind functions
.directive('preloader', function($document){
  return {
    restrict: 'E',
    // scope: true,
    template: ' \
                <div class="preloader-wrapper active"> \
                  <div class="spinner-layer spinner-blue-only"> \
                    <div class="circle-clipper left"> \
                      <div class="circle"></div> \
                    </div><div class="gap-patch"> \
                      <div class="circle"></div> \
                    </div><div class="circle-clipper right"> \
                      <div class="circle"></div> \
                    </div> \
                  </div> \
                </div> \
              ',
    // controllerAs: 'ctl',
    // link: function(scope, element, attrs, controller, transcludeFn) {


    // }//-link
}});