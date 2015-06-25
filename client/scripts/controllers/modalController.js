var app = angular.module('pricing');

app.controller('ModalCtrl', [
  '$scope', '$element', 'title', 'close', 'quoteID',
  function($scope, $element, title, close, quoteID) {

  $scope.title = title;
  $scope.quoteID = quoteID;
  
  //  This close function doesn't need to use jQuery or bootstrap, because
  //  the button has the 'data-dismiss' attribute.
  $scope.close = function() {
 	  close({
      currencyAmountToBuy: this.currencyAmountToBuy,
      currencyAmountToSell: this.currencyAmountToSell
    }, 500); // close, but give 500ms for bootstrap to animate
  };

  //  This cancel function must use the bootstrap, 'modal' function because
  //  the doesn't have the 'data-dismiss' attribute.
  $scope.cancel = function() {

    //  Manually hide the modal.
    $element.modal('hide');
    
    //  Now call close, returning control to the caller.
    close({
      currencyAmountToBuy: this.currencyAmountToBuy,
      currencyAmountToSell: this.currencyAmountToSell
    }, 500); // close, but give 500ms for bootstrap to animate
  };

}]);