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
        'price': tickerPrice,
        'orderType': this.orderType
      }, orderData);

      /* post to server*/
      if (this.orderType == "Market") {
        //Firstly, publish order to Quantum
        //$scope.addToQuantum(fullOrder);
        //Then save the order to the DB
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
    };

    //Calculated field to hold the total order price
    $scope.totalOrderPrice = function() {
      if ($scope.data.currencyAmountToBuy && $scope.tickerPrice) {
        return $scope.data.currencyAmountToBuy * $scope.tickerPrice;
      }
      else {
        return 0;
      }
    };

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

    /*
     * Adds the new order to Quantum
     */
    $scope.addToQuantum = function(orderData) {

      //Firstly, get the next available Quantum ID
      var dealSetNoResult = 0;
      var httpReq = $http.get('/users/getQTDealset')
        .success(function(data, status, headers, config) {
          //ensure we received a response
          if (data.length < 1) {
            return;
          }
          dealSetNoResult = data.GetDealSetNoResult;

          //Then construct the JSON message and post the order
          var today = new Date();
          var todayStr = today.toISOString();
          var valueDate = new Date();
          var valueStr = new Date(valueDate.setDate(valueDate.getDate() + 2)).toISOString();

          var args = {
            "DM2FXDealID": "300000001",
            "DealInstrument": "FX Spot",
            "DM2CptyID": "80000003",
            "BUnitName": "Sydney Cash Unit",
            "MaturityDate": valueStr,
            "DealDate": todayStr,
            "ValueDate": valueStr,
            "Created": todayStr,
            "ExternalDealSetID": dealSetNoResult,
            "BuyCurr": orderData.ticker.substr(0, 3),
            "SellCurr": orderData.ticker.substr(3, 3),
            "BuyAmount": orderData.currencyAmountToBuy,
            "SellAmount": 1,
            "ContractRate": 1.9,
            "SpotRate": orderData.price,
            "ForwardPoints": 0,
            "DealerName": "Jakco Huang"
          };

          $http.post('/users/postQTFXDeal', args)
            .success(function(data, status, headers, config) {
              $scope.quantumID = dealSetNoResult;
              return dealSetNoResult;
            })
            .error(function(data, status, headers, config) {
              console.log("Unable to connect to Quantum to postQTFXDeal. Status is: " + status);
            });
        })
        .error(function(data, status, headers, config) {
          console.log("Unable to connect to Quantum to getQTDealset. Status is: " + status);
        });
    };
  }
]);