var fxApp = angular.module('pricing');

// Configure the navigation and routing - this uses ui-router
fxApp.config(function($stateProvider, $urlRouterProvider) {

    $urlRouterProvider.otherwise('/home');

    $stateProvider

    // HOME STATES AND NESTED VIEWS ========================================
    .state('home', {
        url: '/home',
        templateUrl: 'views/partials/watchlist.html'
    })

    .state('login', {
        url: '/login',
        templateUrl: 'views/partials/login.html'
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

    .state('orderDetail', {
        url: '/orderdetail/:orderID',
        templateUrl: 'views/partials/orderdetail.html',
        controller: function($scope, $stateParams) {
            $scope.orderID = $stateParams.orderID;
        }
    })

    .state('showsymbol', {
        url: '/showsymbol/:symbolID',
        templateUrl: 'views/partials/showsymbol.html',
        controller: function($scope, $stateParams) {
            $scope.symbolID = $stateParams.symbolID;
        }
    });
});
