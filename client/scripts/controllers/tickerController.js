var app = angular.module('pricing', ['angularModalService', 'ui.grid', 'ui.router']);

app.controller('tickerCtrl', ['$scope', '$timeout', '$compile', '$http', '$state', '$sce', 'ModalService',
    function($scope, $timeout, $compile, $http, $state, $sce, ModalService) {

        var socket = io.connect();

        $scope.quotes = [];
        $scope.pendingOrders = [];
        $scope.newticker = '';
        $scope.ticker = '';
        $scope.price = '';
        $scope.balance = {};
        $scope.orders = [];
        $scope.orderModalResult = null;
        $scope.addWatchlistResult = false;
        $scope.quotewidgetcoll = {
            quotewidgetobject: []
        };
        $scope.selectedObjectIndex = null;
        $scope.tickerList = {};
        $scope.symbolID = null;
        $scope.notifications = [];
        $scope.news = {};
        $scope.countryToCurrencyMap = {};
        $scope.orderType = "Market";
        $scope.selectedOrderRow = null;
        $scope.currentUser = null;

        $scope.setCurrentUser = function(user) {
            $scope.currentUser = user;
        };
        /*
         * Handle the quote being sent from node.js server via socket.io
         */
        socket.on('quote', function(data) {
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
                    //Add an indicator to calculate the price change. We'll use this 
                    //to display a price change indicator on the UI
                    $scope.quotes[i] = angular.extend({}, {
                        'priceChange': $scope.quotes[i].price - data.price
                    }, data);
                    tickerFound = true;
                    break;
                }
            }
            if (!tickerFound) {
                $scope.quotes.push(data);
            }
            $scope.$apply();
            $scope.triggerPendingOrders(data);
        });

        /*
         * Handle the news being sent from node.js server via socket.io
         */
        socket.on('news', function(data) {
            $scope.news = data;
        });

        /*
         * Send a request for a quote to the node.js server via socket.io
         */
        $scope.send = function send() {
            socket.emit('ticker', $scope.newticker);
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
        $scope.triggerPendingOrders = function(newQuote) {
            for (var i = 0; i < $scope.pendingOrders.length; i++) {
                if ($scope.pendingOrders[i].ticker == newQuote.ticker &&
                    Number($scope.pendingOrders[i].limitPrice) > Number(newQuote.price)) {
                    $scope.pendingOrders[i].price = newQuote.price;

                    //Convert to open order and remove the pending order now that it's fulfilled
                    $http.post('/orders/delpendingorder', $scope.pendingOrders[i]);
                    $http.post('/orders/addorder', $scope.pendingOrders[i]);
                    $scope.orders.push($scope.pendingOrders[i]);

                    //Update user's balance
                    $scope.balance[0].netunsettled -= (Number($scope.pendingOrders[i].currencyAmountToBuy) * Number($scope.pendingOrders[i].price));
                    $scope.balance[0].cashbalance -= (Number($scope.pendingOrders[i].currencyAmountToBuy) * Number($scope.pendingOrders[i].price));
                    $scope.balance[0].assetvalue += (Number($scope.pendingOrders[i].currencyAmountToBuy) * Number($scope.pendingOrders[i].price));
                    $scope.updateBalance();


                    //Notify user
                    $scope.notifications.push({
                        "ticker": newQuote.ticker,
                        "price": newQuote.price,
                        "fulfilDate": new Date(),
                        "limitPrice": $scope.pendingOrders[i].limitPrice,
                        "units": $scope.pendingOrders[i].currencyAmountToBuy,
                        "message": "Pending order fulfilled"
                    });
                    $http.post('/users/addnotification', {
                        "ticker": newQuote.ticker,
                        "price": newQuote.price,
                        "fulfilDate": new Date(),
                        "limitPrice": $scope.pendingOrders[i].limitPrice,
                        "units": $scope.pendingOrders[i].currencyAmountToBuy,
                        "message": "Pending order fulfilled"
                    });

                    //remove the pending order
                    $scope.pendingOrders.splice(i, 1);
                }
            }
        };
        /*
         * Show the order modal to enable user to capture an order
         */
        $scope.showOrderModal = function(ticker) {

            var getQuoteID = null;
            for (var i = 0; i < $scope.quotes.length; i++) {
                if ($scope.quotes[i].ticker == ticker.toUpperCase()) {
                    getQuoteID = i;
                    break;
                }
            }
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
                    var orderType = result.order.orderType;
                    if (result.order.orderType == "Market") {
                        $scope.orderModalResult = $sce.trustAsHtml("<strong>Order for " + $scope.quotes[getQuoteID].ticker + " successful.</strong>" +
                            " You have bought " + result.order.currencyAmountToBuy + " units of " + $scope.quotes[getQuoteID].ticker +
                            " at a price of " + $scope.quotes[getQuoteID].price);
                    }
                    else {
                        $scope.orderModalResult = $sce.trustAsHtml("<strong>Pending order for " + $scope.quotes[getQuoteID].ticker + " created.</strong>" +
                            " You are waiting to buy " + result.order.currencyAmountToBuy + " units of " + $scope.quotes[getQuoteID].ticker +
                            " at a price of " + result.order.limitPrice + " or better");

                    }
                    if (result.order.orderType == 'Limit') {
                        // We need to get back the pending order from the DB with it's _id value
                        // For 2 reasons:
                        // 1) Each time we receive a quote, pending orders may be triggered. This
                        // takes place on the client (it should be on server, but I'll move it later)
                        // 2) After a pending order is triggered the pending order is deleted. This 
                        // requires the _id column from the DB
                        $scope.balance[0].netunsettled += (Number(result.order.currencyAmountToBuy) * Number($scope.quotes[getQuoteID].price));
                        $scope.updateBalance();
                        $scope.loadPendingOrders();
                    }
                    else {
                        //Update the user's balance
                        $scope.balance[0].cashbalance -= (Number(result.order.currencyAmountToBuy) * Number($scope.quotes[getQuoteID].price));
                        $scope.balance[0].assetvalue += (Number(result.order.currencyAmountToBuy) * Number($scope.quotes[getQuoteID].price));
                        $scope.updateBalance();
                    }

                    $timeout(function() {
                        $scope.orderModalResult = false;
                    }, 10000);
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
                //ensure we received a response
                if (data.length < 1) {
                    return;
                }
                $scope.balance = data;
                $scope.balance[0].accountvalue = Number(data[0].cashbalance) + Number(data[0].assetvalue);
            }).
            error(function(data, status, headers, config) {
                $scope.balance = {
                    "error retrieving balance": status
                };
            });
        };

        $scope.updateBalance = function() {
            var httpReq = $http.post('/users/updatebalance', $scope.balance[0]).
            success(function(data, status, headers, config) {}).
            error(function(data, status, headers, config) {});
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

                //ensure we received a response
                if (data.length < 1) {
                    return;
                }
                //For some reason this method is called more than once during init(). So
                //if the array is already populated I will not populate it again.
                if (!$scope.tickerList.watchlist || $scope.tickerList.watchlist.length == 0) {
                    $scope.tickerList = data[0];
                    for (var i = 0; i < $scope.tickerList.watchlist.length; i++) {
                        $scope.newticker = $scope.tickerList.watchlist[i];
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

        /*
         * remove item from watchlist
         */
        $scope.removeFromWatchlist = function(ticker) {
            //Firstly, remove the ticker from the tickerList and update the DB
            for (var i = 0; i < $scope.tickerList.watchlist.length; i++) {
                if (ticker == $scope.tickerList.watchlist[i]) {
                    $scope.tickerList.watchlist.splice(i, 1);
                    break;
                }
            }
            var httpReq = $http.post('/users/updatewatchlist', $scope.tickerList)
                .success(function(data, status, headers, config) {
                    //if successful, remove from the quotes array - this will impact the 
                    //display on the Watchlist page, which is bound to the quotes array
                    for (var i = 0; i < $scope.quotes.length; i++) {
                        if (ticker == $scope.quotes[i].ticker) {
                            $scope.quotes.splice(i, 1);
                            break;
                        }
                    }
                })
                .error(function(data, status, headers, config) {
                    //if error, do not remove from the quotes array as we still want to display quotes
                    //for this symbol
                    console.log("TickerCtrl - removeFromWatchlist - Error removing item from watchlist." + "Ticker: " + ticker + ", status: " + status);
                });
        };

        /*
         * add item to watchlist
         */
        $scope.addToWatchlist = function(ticker) {
            //If symbol is invalid, do not add to watchlist
            if (!$scope.isValidSymbol(ticker)) {
                $scope.addWatchlistResult = $sce.trustAsHtml("<strong>" + ticker + "</strong> is invalid - cannot add to watchlist");
                $timeout(function() {
                    $scope.addWatchlistResult = false;
                }, 5000);
                return false;
            }

            //If ticker is already in watchlist, no action required
            for (var i = 0; i < $scope.tickerList.watchlist.length; i++) {
                if (ticker == $scope.tickerList.watchlist[i]) {
                    $scope.addWatchlistResult = $sce.trustAsHtml("<strong>" + ticker + "</strong> is already in your watchlist");
                    $timeout(function() {
                        $scope.addWatchlistResult = false;
                    }, 5000);
                    return false;
                }
            }

            //Otherwise, add to the watchlist and update the DB
            $scope.tickerList.watchlist.push(ticker);
            var httpReq = $http.post('/users/updatewatchlist', $scope.tickerList).
            success(function(data, status, headers, config) {
                //if successful, send to server to obtain a quote, and add to the quotes array 
                // - this will impact the display on the Watchlist page, which is bound to the quotes array
                //$scope.newticker = ticker;
                //$scope.send();
                $scope.addWatchlistResult = $sce.trustAsHtml("<strong>" + ticker + "</strong> successfully added to watchlist");
                $timeout(function() {
                    $scope.addWatchlistResult = false;
                }, 5000);
            }).
            error(function(data, status, headers, config) {});
        };

        $scope.loadCountryToCurrency = function() {
            var httpReq = $http.get('/ref/countrytocurrency').
            success(function(data, status, headers, config) {
                //ensure we received a response
                if (data.length < 1) {
                    return;
                }
                $scope.countryToCurrencyMap = data[0];
            }).
            error(function(data, status, headers, config) {
                $scope.countryToCurrencyMap = {
                    "error retrieving country to currency mapping": status
                };
            });
        };

        $scope.getCountryForCurrency = function(currency) {
            if (!$scope.countryToCurrencyMap) {
                $scope.loadCountryToCurrency();
            }
            for (var prop in $scope.countryToCurrencyMap) {
                if ($scope.countryToCurrencyMap.hasOwnProperty(prop)) {
                    if ($scope.countryToCurrencyMap[prop] === currency) {
                        return prop;
                    }
                }
            }
            return null;
        };

        $scope.getFlagForFirstCurrency = function(symbol) {
            var firstCurrency = symbol.substr(0, 3);
            if (firstCurrency) {
                return "views/images/flags/" + $scope.getCountryForCurrency(firstCurrency) + ".png";
            }
        };

        $scope.getFlagForSecondCurrency = function(symbol) {
            var secondCurrency = symbol.substr(3, 3);
            if (secondCurrency) {
                return "views/images/flags/" + $scope.getCountryForCurrency(secondCurrency) + ".png";
            }
        };

        $scope.removePendingOrder = function(orderID) {
            var arrayLength = $scope.pendingOrders.length;
            var idFound = false;
            for (var i = 0; i < arrayLength; i++) {
                if ($scope.pendingOrders[i]._id == orderID) {
                    $http.post('/orders/delpendingorder', $scope.pendingOrders[i]);
                    $scope.pendingOrders.splice(i, 1);
                    idFound = true;
                    break;
                }
            }
        };

        $scope.removeNotification = function(notificationID) {
            var arrayLength = $scope.notifications.length;
            var idFound = false;
            for (var i = 0; i < arrayLength; i++) {
                if ($scope.notifications[i]._id == notificationID) {
                    $http.post('/users/delnotification', $scope.notifications[i]);
                    $scope.notifications.splice(i, 1);
                    idFound = true;
                    break;
                }
            }
        };

        $scope.handleSearchSymbolSubmit = function() {
            var symbolToSearch = this.data.symbolToSearch.toUpperCase();

            //Add the symbol to 'quotes' so that 
            //prices are fetched from the server.
            //Do not add to watchlist (tickerList)
            var arrayLength = $scope.quotes.length;
            var tickerFound = false;
            for (var i = 0; i < arrayLength; i++) {
                if ($scope.quotes[i].ticker == symbolToSearch) {
                    tickerFound = true;
                }
            }
            if (!tickerFound) {
                $scope.newticker = symbolToSearch;
                $scope.send();
            }

            $state.go('showsymbol', {
                symbolID: symbolToSearch
            });
        };

        $scope.handleDepositFunds = function() {
            this.showDepositFunds = false;
            var fundsToDeposit = Number(this.data.fundsToDeposit);
            $scope.balance[0].cashbalance = $scope.balance[0].cashbalance + fundsToDeposit;
            $scope.balance[0].accountvalue = $scope.balance[0].cashbalance + $scope.balance[0].assetvalue;
            $scope.updateBalance();
            $scope.fundsDepositResult = true;
            $timeout(function() {
                $scope.fundsDepositResult = false;
            }, 7000);
        };

        $scope.handleWithdrawFunds = function() {
            this.showWithdrawFunds = false;
            var fundsToWithdraw = Number(this.data.fundsToWithdraw);
            $scope.balance[0].cashbalance = $scope.balance[0].cashbalance - fundsToWithdraw;
            $scope.balance[0].accountvalue = $scope.balance[0].cashbalance + $scope.balance[0].assetvalue;
            $scope.updateBalance();
            $scope.fundsWithdrawResult = true;
            $timeout(function() {
                $scope.fundsWithdrawResult = false;
            }, 7000);
        };

        $scope.showChart = function(ticker) {
            $scope.symbolID = ticker;
            $state.go('chart', {
                symbolID: ticker
            });
        };

        $scope.showOrderDetail = function() {
            $scope.selectedOrder = this.item;
            $scope.selectedOrderRow = this.$index;

            $state.go('orderDetail', {
                orderID: this.item._id
            });
        };

        $scope.toggleOrderType = function(orderType) {
            $scope.orderType = orderType;
        };

        //This function will execute once the controller is initialised. 
        $scope.init = function() {
            $scope.loadWatchlist();
            $scope.loadPendingOrders();
            $scope.loadBalance();
            $scope.loadCountryToCurrency();
            $scope.getCountryForCurrency("GB");
        };

        //Run the init function on startup
        $scope.init();

        //Supporting functions
        /*
         * Very primitive check to see whether the symbol is valid. If the symbol
         * does not exist in 'quotes', deem it invalid
         */
        $scope.isValidSymbol = function(ticker) {
            var arrayLength = $scope.quotes.length;
            for (var i = 0; i < arrayLength; i++) {
                if ($scope.quotes[i].ticker == ticker && $scope.quotes[i].price > -1) {
                    return true;
                }
            }
            return false;
        };
    }
]);
