var app = angular.module('pricing', ['angularModalService']);

app.controller('tickerController', ['$scope', 'ModalService', function($scope, ModalService) {
//app.controller('tickerController', function($scope) {
    var socket = io.connect();

    $scope.quote = {}
    $scope.quotedata = {};
    $scope.quotes = [];
    $scope.tickers = [];
    $scope.newticker = '';
    $scope.ticker = '';
    $scope.price = '';
    $scope.orderModalResult = null;

    socket.on('quote', function(data) {
        $scope.quote = data;
        $scope.price = data.price;
        $scope.ticker = data.ticker;
        //Determine whether a quote already exists for this ticker. If so, replace it
        var arrayLength = $scope.quotes.length;
        var tickerFound = false;
        for (var i = 0; i < arrayLength; i++) {
            if ($scope.quotes[i].ticker == $scope.ticker) {
                $scope.quotes[i] = data;
                tickerFound = true;
                break;
            }
        }
        if (!tickerFound) {
            $scope.quotes.push(data);
        }
        $scope.$apply();
        $scope.quote = {};
    });

    $scope.send = function send() {
        socket.emit('ticker', $scope.newticker);
        $scope.tickers.push($scope.newticker);
        //push onto the quotes array to ensure it displays on page, even if no valid quote exists for this ticker
        var data = {};
        data.ticker = $scope.newticker.toUpperCase();
        $scope.quotes.push(data);
        $scope.newticker = '';
    };
    
    
  $scope.showOrderModal = function() {
    ModalService.showModal({
      templateUrl: "orderModal.html",
      controller: "ModalController",
      inputs: {
        title: "A More Complex Example"
      }
    }).then(function(modal) {
      modal.element.modal();
      modal.close.then(function(result) {
        $scope.orderModalResult  = "Name: " + result.name + ", age: " + result.age;
      });
    });

  };
}]);