var app = angular.module('pricing', ['angularModalService', 'ui.grid', 'ui.router']);

app.controller('tickerCtrl', ['$scope', '$timeout', '$compile', '$http', 'ModalService', function($scope, $timeout, $compile, $http, ModalService) {
    var socket = io.connect();

    $scope.quote = {};
    $scope.quotedata = {};
    $scope.quotes = [];
    $scope.openOrders = [];
    $scope.tickers = [];
    $scope.newticker = '';
    $scope.ticker = '';
    $scope.price = '';
    $scope.balance = {};
    $scope.orders = [];
    $scope.orderModalResult = null;
    $scope.quotewidgetcoll = {
        quotewidgetobject: []
    };
    $scope.selectedObjectIndex = null;
    $scope.orderForDebug = null;
    //Quotes to be displayed upon initialisation
    $scope.tickerList = ["USDAUD", "AUDNZD", "USDEUR", "GBPUSD", "USDJPY", "USDCHF", "USDCAD", "USDNZD", "GBPJPY"];


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
    };


    $scope.showOrderModal = function(ticker) {

        var getQuoteID = null;
        for (var i = 0; i < $scope.quotes.length; i++) {
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
                $scope.orderModalResult = "Order successful. You have bought " + result.order.currencyAmountToBuy + " of " + $scope.quotes[getQuoteID].ticker + " at a price of " + $scope.quotes[getQuoteID].price;
                //'result' only has scope within this function. The 'push' pushes by reference (I guess)
                //so once the function completes 'result' disappears and the openOrders array 
                //will contain nothing
                //So - do a deep copy by value instead - which also doesn't work :-( 
                var orderCopy = {};
                angular.copy(result.order, orderCopy);
                $scope.$parent.$parent.orderForDebug = {
                    'greeting': 'hello'
                };
                //I spent so much time on this. It seems that the Modal makes a copy of the
                //$scope, and if you update this in the Modal it will be lost when the Modal
                //closes. So I had to push the order onto the parent scope object to ensure
                //it is still there after the Modal close.
                //However, in the view (the HTML), I had to refer to it using $parent also
                //If I did not use $parent the openOrders array was simply empty
                $scope.$parent.openOrders.push(result.order);
                //$scope.openOrders.push(orderCopy);
                //openOrders.push(orderCopy);


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

    $scope.loadBalance = function() {
        var httpReq = $http.get('/balance/balance').
        success(function(data, status, headers, config) {
            $scope.balance = data;
        }).
        error(function(data, status, headers, config) {
            $scope.balance = {"error retrieving balance":status};
        });
    };

    $scope.loadOrders = function() {
        var httpReq = $http.get('/orders/order').
        success(function(data, status, headers, config) {
            $scope.orders = data;
        }).
        error(function(data, status, headers, config) {
            $scope.orders = {"error retrieving orders":status};
        });
    };

    //This function will execute once the controller is initialised. It will populate
    //quotes, which will be displayed (by priceQuoteDirective) on the main page.
    $scope.init = function() {
        for (var i = 0; i < $scope.tickerList.length; i++) {
            $scope.newticker = $scope.tickerList[i];
            $scope.send();
        }
    };

    //Run the init function on startup
    $scope.init();
}]);

// Configure the navigation and routing
app.config(function($stateProvider, $urlRouterProvider) {

    $urlRouterProvider.otherwise('/home');

    $stateProvider

    // HOME STATES AND NESTED VIEWS ========================================
        .state('home', {
        url: '/home',
        templateUrl: 'partial-home.html'
    })

    .state('openorders', {
        url: '/openorders',
        templateUrl: 'views/partials/openorders.html'
    })

    .state('pendingorders', {
        url: '/pendingorders',
        templateUrl: 'views/partials/pendingorders.html'
    })

    .state('watchlist', {
        url: '/watchlist',
        templateUrl: 'views/partials/watchlist.html'
    })

    .state('balance', {
        url: '/balance',
        templateUrl: 'views/partials/balance.html'
    })

    .state('notifications', {
        url: '/notifications',
        templateUrl: 'views/partials/notifications.html'
    })

    // ABOUT PAGE AND MULTIPLE NAMED VIEWS =================================
    .state('about', {
        // we'll get to this in a bit       
    });

});