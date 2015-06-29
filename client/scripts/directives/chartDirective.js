angular.module('pricing')
    .directive('chartdirective', function($compile) {
        return {
            restrict: 'AE',
            templateUrl: '/views/partials/widgets/chartWidget.html',
        };
    });
