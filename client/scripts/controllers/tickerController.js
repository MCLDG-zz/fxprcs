var app = angular.module('pricing', ['angularModalService', 'ui.grid']);

app.controller('tickerCtrl', ['$scope', '$timeout', '$compile', 'ModalService', function($scope, $timeout, $compile, ModalService) {
    var socket = io.connect();

    $scope.quote = {};
    $scope.quotedata = {};
    $scope.quotes = [];
    $scope.openOrders = [];
    $scope.tickers = [];
    $scope.newticker = '';
    $scope.ticker = '';
    $scope.price = '';
    $scope.orderModalResult = null;
    $scope.quotewidgetcoll = {
        quotewidgetobject: []
    };
    $scope.selectedObjectIndex = null;
    $scope.orderForDebug = null;
    //$scope.quoteID = null;


    socket.on('quote', function(data) {
        $scope.quote = data;
        $scope.price = data.price;
        $scope.ticker = data.ticker;
        //Determine whether a quote already exists for this ticker. If so, replace it
        
        /*
        TODO: OK, it seems that Angular 1.4 has removed the automatic alphabetic sorting of the collection
        before providing it to ng-repeat; it is now sorted by 'key in Obj' by the browser, which usually results
        in the keys sorted in the order in which they were added. If an item is replaced, like I do below, it
        may cause the order to change
        */
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
        //$scope.newticker = '';
    };


    $scope.showOrderModal = function(ticker) {

        var getQuoteID = null;
        for (var i=0; i < $scope.quotes.length; i++) {
            if ($scope.quotes[i].ticker == ticker.toUpperCase()) {
                getQuoteID = i;
                break;
            }
        }
        //$scope.quoteID = quoteID;

        ModalService.showModal({
            templateUrl: "views/orderModal.html",
            controller: "ModalCtrl",
            inputs: {
                title: "Place an Order for " + $scope.quotes[i].ticker,
                tickerID: $scope.quotes[i].ticker,
                tickerPrice: $scope.quotes[i].price
            }
        }).then(function(modal) {
            modal.element.modal();
            modal.close.then(function(result) {
                $scope.orderModalResult = "Order successful. You have bought " + result.currencyAmountToBuy + " of " +  $scope.quotes[getQuoteID].ticker + " at a price of " + $scope.quotes[getQuoteID].price;
                //'result' only has scope within this function. The 'push' pushes by reference (I guess)
                //so once the function completes 'result' disappears and the openOrders array 
                //will contain nothing
                //So - do a deep copy by value instead.
                var orderCopy = {};
                angular.copy(result.order, orderCopy);
                $scope.orderForDebug = {'greeting':'hello'};
                $scope.openOrders.push(orderCopy);

                $timeout(function() {
                    $scope.orderModalResult = false;
                }, 5000);
            });
        });
    };

    /*
    We instantiate the directive and add it to an array of widgets. Index.html will then 
    render this
    */
    $scope.addQuoteWidget = function() {
        var compileFunction = $compile('<div quotewidgetdirective></div>'); //compile HTML fragment
        var htmlOuputFromDirective = compileFunction($scope); //get HTML output from directive after applying $scope
        $scope.quotewidgetcoll.quotewidgetobject.push(htmlOuputFromDirective);
    };

    $scope.closeQuoteWidget = function(index) {
        // TODO: how to ensure we are removing the correct directive? This just removes the last one
        $scope.quotewidgetcoll.quotewidgetobject.splice(index, 1);
    };

    $scope.selectObject = function($index) {
        $scope.selectedObjectIndex = $index;
    };
}]);