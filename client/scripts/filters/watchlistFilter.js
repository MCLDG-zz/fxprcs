var fxApp = angular.module('pricing');

fxApp.filter('inWatchlistArray', function($filter) {
    return function(list, arrayFilter, element) {
        if (arrayFilter) {
            return $filter("filter")(list, function(listItem) {
                return arrayFilter.indexOf(listItem[element]) != -1;
            });
        }
    };
});