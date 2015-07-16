var app = angular.module('pricing');

app.controller('ModalCtrl', [
  '$scope', '$element', '$http', 'title', 'close', 'tickerID', 'tickerPrice',
  function($scope, $element, $http, title, close, tickerID, tickerPrice) {

    $scope.title = title;
    $scope.tickerID = tickerID;
    $scope.tickerPrice = tickerPrice;
    $scope.data = {};

    /*
    Handle the form submit from orderModal.html
    
    While compiling the Form angular created the 'order' object
    which converts the form data to JSON automatically, so return this to the 
    caller
    */
    $scope.handleOpenOrderFormSubmit = function() {
      var orderData = this.data;
      var fullOrder = angular.extend({}, {
        'ticker': tickerID,
        'price': tickerPrice
      }, orderData);

      /* post to server*/
      if (orderData.mode == "Market") {
        $http.post('/orders/addorder', fullOrder);
      }
      else {
        $http.post('/orders/addpendingorder', fullOrder);
      }

      //  Manually hide the modal.
      $element.modal('hide');

      close({
        order: fullOrder
      }, 500); // close, but give 500ms for bootstrap to animate
    }

    //  This close function doesn't need to use jQuery or bootstrap, because
    //  the button has the 'data-dismiss' attribute.
    $scope.close = function() {
      close({
        currencyAmountToBuy: this.currencyAmountToBuy,
        currencyAmountToSell: this.currencyAmountToSell
          //Add to the list of open orders
      }, 500); // close, but give 500ms for bootstrap to animate
    };

    //  This cancel function must use the bootstrap, 'modal' function because
    //  the button doesn't have the 'data-dismiss' attribute.
    $scope.cancel = function() {

      //  Manually hide the modal.
      $element.modal('hide');
    };

  }
]);