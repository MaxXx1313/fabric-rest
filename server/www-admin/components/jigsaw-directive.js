angular.module('nsd.directive.jigsaw', [])

// scope:
// = is for two-way binding
// @ simply reads the value (one-way binding)
// & is used to bind functions
.directive('jigsaw', function($document){
  return {
    restrict: 'E',
    // scope: true,
    scope: {
        top: '@',
        right: '@',
        bottom: '@',
        left: '@',
    },
    transclude: true,
    template: ' \
                <span class="top"   ng-class="::{\'inset\':  top==\'inset\'}"  ng-if="::top"></span> \
                <span class="right" ng-class="::{\'inset\':  right==\'inset\'}"  ng-if="::right"></span> \
                <span class="bottom" ng-class="::{\'inset\': bottom==\'inset\'}" ng-if="::bottom"></span> \
                <span class="left"   ng-class="::{\'inset\': left==\'inset\'}" ng-if="::left"></span> \
                <span class="text"><ng-transclude></ng-transclude></span> \
              ',
    controllerAs: 'ctl',
    link: function(scope, element, attrs, controller, transcludeFn) {


    }//-link
}})

// scope:
// = is for two-way binding
// @ simply reads the value (one-way binding)
// & is used to bind functions
.directive('jigsawLine', function($document){
  return {
    restrict: 'EA',
    // scope: true,
    transclude: true,
    template: '',
    // controllerAs: 'ctl',
    // link: function(scope, element, attrs, controller, transcludeFn) {


    // }// - link
}});


