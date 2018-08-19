/**
 * @class BlocksController
 * @classdesc
 * @ngInject
 */
function BlocksController(ChannelService, ConfigLoader, $scope) {

  var ctl = this;

  ctl.channels = [];
  ctl.blocks = [];
  ctl.selectedIndex = null;
  ctl.blockInfo = null;
  ctl.loadingBlocks = false;
  ctl.loadingInfo = false;

  /**
   *
   */
  ctl.getChannels = function(){
    return ChannelService.list().then(function(dataList){
      ctl.channels = dataList;
    });
  };


  /**
   *
   */
  ctl.loadMore = function() {
    var latestBlock = ctl.blocks[ctl.blocks.length-1];

    return ctl.loadBlocks($scope.selectedChannel.channel_id, latestBlock.index);
  };

  /**
   *
   */
  ctl.loadBlocks = function(channelId, index) {
    ctl.loadingBlocks = true;
    return ChannelService.getBlocks(channelId, index || undefined)
      .then(function(blocks) {
        ctl.loadingBlocks = false;
        ctl.blocks.push.apply(ctl.blocks, blocks);
      })
      .catch(function(e) {
        ctl.loadingBlocks = false;
        throw e;
      });
  };

  /**
   *
   */
  ctl.loadBlockInfo = function(selectedIndex) {
    ctl.selectedIndex = selectedIndex;
    ctl.blockInfo = null;
    if (!selectedIndex) {
      return;
    }
    ctl.loadingInfo = true;
    return ChannelService.getBlock($scope.selectedChannel.channel_id, selectedIndex)
      .then(function(blockInfo) {
        ctl.blockInfo = blockInfo;
        ctl.loadingInfo = false;
      })
      .catch(function(e) {
        ctl.loadingInfo = false;
        throw e;
      });
  };


  //
  $scope.$watch('selectedChannel', function(selectedChannel){
    var channelId = selectedChannel ? selectedChannel.channel_id : null;
    if (!channelId) {
      return;
    }
    return ctl.loadBlocks(channelId);
  });


  //
  ctl.getChannels();
}

angular.module('nsd.controller.blocks', [
  'nsd.service.channel',
  'nsd.directive.jigsaw',
  'nsd.directive.preloader',
  'nsd.directive.blockView'
])
.controller('BlocksController', BlocksController);