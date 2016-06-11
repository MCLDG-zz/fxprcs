angular.module('pricing')
    .directive('quotewidgetdirective', function($compile) {
        return {
            restrict: 'AE',
            templateUrl: '/views/partials/widgets/priceQuoteWidgetAuto.html',
        };
    });
