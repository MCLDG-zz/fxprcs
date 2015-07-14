var app = angular.module('pricing', ['angularModalService', 'ui.grid', 'ui.router']);

app.controller('tickerCtrl', ['$scope', '$timeout', '$compile', '$http', 'ModalService', function($scope, $timeout, $compile, $http, ModalService) {
    var socket = io.connect();

    $scope.quote = {};
    $scope.quotedata = {};
    $scope.quotes = [];
//    $scope.openOrders = [];
    $scope.pendingOrders = [];
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
    //$scope.tickerList = ["USDAUD", "AUDNZD", "USDEUR", "GBPUSD", "USDJPY", "USDCHF", "USDCAD", "USDNZD", "GBPJPY"];
    $scope.tickerList = [];
    $scope.symbolID = null;
    $scope.notifications = [];
    $scope.news = {};

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
        
        $scope.triggerPendingOrders(data);
    });

    socket.on('news', function(data) {
        $scope.news = data;
    });

    $scope.send = function send() {
        socket.emit('ticker', $scope.newticker);
        //$scope.tickers.push($scope.newticker);
        //push onto the quotes array to ensure it displays on page, even if no valid quote exists for this ticker
        var data = {};
        data.ticker = $scope.newticker.toUpperCase();
        $scope.quotes.push(data);
    };

    /*
    * Loop through all pending orders. If triggered by
    * the new quote we have just received, convert pending order  
    * to open order at the quote price
    */
    $scope.triggerPendingOrders = function (newQuote) {
        for (var i = 0; i < $scope.pendingOrders.length; i++) {
            if ($scope.pendingOrders[i].ticker == newQuote.ticker &&
                Number($scope.pendingOrders[i].limitPrice) > Number(newQuote.price)) {
                $scope.pendingOrders[i].price = newQuote.price;
                //Convert to open order and remove the pending order now that it's fulfilled
                $http.post('/orders/delpendingorder', $scope.pendingOrders[i]);
                $http.post('/orders/addorder', $scope.pendingOrders[i]);
                $scope.orders.push($scope.pendingOrders[i]);

                //Notify user
                $scope.notifications.push({"ticker": newQuote.ticker, "price": newQuote.price, 
                    "fulfilDate": new Date(), "limitPrice": $scope.pendingOrders[i].limitPrice,
                    "message": "Pending order fulfilled"});
                $http.post('/users/addnotification', {"ticker": newQuote.ticker, "price": newQuote.price, 
                    "fulfilDate": new Date(), "limitPrice": $scope.pendingOrders[i].limitPrice,
                    "message": "Pending order fulfilled"});

                //remove the pending order
                $scope.pendingOrders.splice(i,1);
            }
        }
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
                //I spent so much time on this. It seems that the Modal makes a copy of the
                //$scope, and if you update this in the Modal it will be lost when the Modal
                //closes. So I had to push the order onto the parent scope object to ensure
                //it is still there after the Modal close.
                //However, in the view (the HTML), I had to refer to it using $parent also
                //If I did not use $parent the openOrders array was simply empty
//                $scope.$parent.openOrders.push(result.order);
                if (result.order.mode == 'Limit') {
                    $scope.pendingOrders.push(result.order);
                    $scope.$parent.pendingOrders.push(result.order);
                    // We need to get back the pending order from the DB with it's _id value
                    // For 2 reasons:
                    // 1) Each time we receive a quote, pending orders may be triggered. This
                    // takes place on the client (it should be on server, but I'll move it later)
                    // 2) After a pending order is triggered the pending order is deleted. This 
                    // requires the _id column from the DB
                    $scope.loadPendingOrders();
                } else {
                    $scope.updateBalance($scope.balance);
                }

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
        var httpReq = $http.get('/users/balance').
        success(function(data, status, headers, config) {
            $scope.balance = data;
        }).
        error(function(data, status, headers, config) {
            $scope.balance = {
                "error retrieving balance": status
            };
        });
    };

    $scope.updateBalance = function() {
        var httpReq = $http.post('/users/updatebalance', $scope.balance).
        success(function(data, status, headers, config) {
        }).
        error(function(data, status, headers, config) {
        });
    };

    $scope.loadNotifications = function() {
        var httpReq = $http.get('/users/notification').
        success(function(data, status, headers, config) {
            $scope.notifications = data;
        }).
        error(function(data, status, headers, config) {
            $scope.notifications = {
                "error retrieving notifications": status
            };
        });
    };

    $scope.loadOrders = function() {
        var httpReq = $http.get('/orders/order').
        success(function(data, status, headers, config) {
            $scope.orders = data;
        }).
        error(function(data, status, headers, config) {
            $scope.orders = {
                "error retrieving orders": status
            };
        });
    };

    $scope.loadPendingOrders = function() {
        var httpReq = $http.get('/orders/pendingorder').
        success(function(data, status, headers, config) {
            $scope.pendingOrders = data;
        }).
        error(function(data, status, headers, config) {
            $scope.pendingOrders = {
                "error retrieving pending orders": status
            };
        });
    };

    //This function will load the watchlist from Mongodb, then populate
    //quotes, which will be displayed (by priceQuoteDirective) on the main page.
    $scope.loadWatchlist = function() {
        var httpReq = $http.get('/users/watchlist').
        success(function(data, status, headers, config) {

            //For some reason this method is called more than once during init(). So
            //if the array is already populated I will not populate it again.
            if ($scope.tickerList.length == 0) {
                $scope.tickerList = data[0].watchlist;
                for (var i = 0; i < $scope.tickerList.length; i++) {
                    $scope.newticker = $scope.tickerList[i];
                    $scope.send();
                }
            }
        }).
        error(function(data, status, headers, config) {
            $scope.tickerList = {
                "error retrieving watchlist": status
            };
        });
    };

    //This function will execute once the controller is initialised. 
    $scope.init = function() {
        $scope.loadWatchlist();
        $scope.loadPendingOrders();
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
        templateUrl: 'views/partials/watchlist.html'
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

    .state('news', {
        url: '/news',
        templateUrl: 'views/partials/news.html'
    })

    .state('chart', {
        url: '/chart',
        templateUrl: 'views/partials/widgets/chartWidget.html'
    })

    .state('showsymbol', {
        url: '/showsymbol/:symbolID',
        templateUrl: 'views/partials/showsymbol.html',
        controller: function ($scope, $stateParams) {
            $scope.symbolID = $stateParams.symbolID;
        }
    })
 
    // ABOUT PAGE AND MULTIPLE NAMED VIEWS =================================
    .state('about', {
        // we'll get to this in a bit       
    });

});