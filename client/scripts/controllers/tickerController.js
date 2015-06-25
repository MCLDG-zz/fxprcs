var app = angular.module('pricing', ['angularModalService']);

app.controller('tickerCtrl', ['$scope', '$timeout', '$compile', 'ModalService', function($scope, $timeout, $compile, ModalService) {
    var socket = io.connect();

    $scope.quote = {};
    $scope.quotedata = {};
    $scope.quotes = [];
    $scope.tickers = [];
    $scope.newticker = '';
    $scope.ticker = '';
    $scope.price = '';
    $scope.orderModalResult = null;
    $scope.quoteIndex = null; //when user places an order, this will contain the index of the quote 
    $scope.quotewidgetcoll = {
        quotewidgetobject: []
    };
    $scope.selectedObjectIndex = null;
    //$scope.quoteID = null;


    socket.on('quote', function(data) {
        $scope.quote = data;
        $scope.price = data.price;
        $scope.ticker = data.ticker;
        //Determine whether a quote already exists for this ticker. If so, replace it
        
        /*TODO: it seems that the array reorders itself - probably when I update it here, 
        or because it is bound to the price widget. This sometimes happens during an order,
        in which case the results are unpredictable (wrong price for ticker, for instance).
        Perhaps I can update the elements in the object instead of replacing the object
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
                title: "Place an Order",
                quoteID: getQuoteID
            }
        }).then(function(modal) {
            modal.element.modal();
            modal.close.then(function(result) {
                $scope.orderModalResult = "Order successful for: " + $scope.quotes[getQuoteID].ticker + ". Buy: " + result.currencyAmountToBuy + ", Sell: " + result.currencyAmountToSell + " Price: " + $scope.quotes[getQuoteID].price;

                $timeout(function() {
                    $scope.orderModalResult = false;
                }, 5000);
            });
        });
    };

    //TODO: there may be a better way to get these onto the scope without 
    //having to instantiate the directive first (for instance, when I do not want this
    //directive to appear on the UI until the user manually adds it)
    
    /* We instantiate the directive and add it to an array of widgets. Index.html will then 
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