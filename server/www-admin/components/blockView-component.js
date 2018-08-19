
angular.module('nsd.directive.blockView', [])

// scope:
// = is for two-way binding
// @ simply reads the value (one-way binding)
// & is used to bind functions
.directive('blockView', function($document){
  return {
    restrict: 'E',
    scope: {
      block: '='
    },
    templateUrl: 'components/blockView.html',

    link: function(scope, element, attrs, controller, transcludeFn) {
      scope.initialized = true;

      scope.$watch('block', function() {

        // clone block data to avoid appearing angular stuff, when we shows 'result' etc. in other site sections
        scope.ctl = {
          block: clone(scope.block),
          result: getBlockResult(scope.block),
          creator: getBlockCreator(scope.block),
          endorsers: getBlockEndorsers(scope.block),
        };

        // hotfix: jquery tabs selection
        setTimeout(function() {
          $(window).resize(); // overkill
          // element.find('ul.tabs').tabs(); // laggy, double initialisation
        }, 0);

      });

      /**
       * @return {Certificate}
       */
      function clone(block) {
        return JSON.parse(JSON.stringify(block));
      }

      /**
       * @return {Certificate}
       */
      function getBlockCreator(block) {
        var result;
        if (!block) {
          return result;
        }
        try {
          result = block.data.data[0].payload.header.signature_header.creator.IdBytes;
        } catch(e) {
          console.info(e);
          result = null
        }
        return result;
      }


      /**
       * @return {Array<Certificate>}
       */
      function getBlockEndorsers(block) {
        var result;
        if (!block) {
          return result;
        }
        try {
          result = block.data.data[0].payload.data.actions[0].payload.action.endorsements.map(e => e.endorser.IdBytes);
        } catch(e) {
          console.info(e);
          result = null
        }
        return result;
      }

      /**
       * @return {object}
       */
      function getBlockResult(block) {
        var result = null;
        if (!block) {
          return result;
        }

        try {
          result = {};
          // TODO: loop trough actions
          var blockExtension = block.data.data[0].payload.data.actions[0].payload.action.proposal_response_payload.extension;
          var ns_rwset = blockExtension.results.ns_rwset;
          ns_rwset = ns_rwset.filter(function(action){return action.namespace != "lscc"}); // filter system chaincode

          ns_rwset.forEach(function(action){
            result[action.namespace] = action.rwset.writes.reduce(function(result, element){
              result[element.key] = element.is_delete ? null : element.value;
              return result;
            }, {});

          });
        } catch(e) {
          console.info(e);
          result = null
        }
        return result;
      }

    }
}});