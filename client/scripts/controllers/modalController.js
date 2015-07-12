var app = angular.module('pricing');

app.controller('ModalCtrl', [
  '$scope', '$element', 'title', 'close', 'tickerID', 'tickerPrice', 
  function($scope, $element, title, close, tickerID, tickerPrice) {

    $scope.title = title;
    $scope.tickerID = tickerID;
    $scope.tickerPrice = tickerPrice;
    $scope.data = {};

    $scope.handleOpenOrderFormSubmit = function() {
      var orderData = this.data;
      //orderData = this.data.concat([{ticker: tickerID, price: tickerPrice}]);
      angular.extend( {'ticker': tickerID, 'price': tickerPrice}, orderData);

      /* post to server*/
      //$http.post(url, data);      
      
      //  Manually hide the modal.
      $element.modal('hide');

      close({
        /* 
        While compiling the Form angular created the 'order' object
        which converts the form data to JSON automatically, so return this to the 
        caller
        */
        order: orderData 
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