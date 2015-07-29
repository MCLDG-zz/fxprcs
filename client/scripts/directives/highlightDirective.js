/*
This will highlight an element passed to the directive when the value
of the bound value changes, for example:

        <tr data-ng-repeat="item in quotes track by $index" class="list">
          <td highlighter="item.price" class="span2">{{item.price}}</td>
        </tr>

In this case, whenever item.price changes the element will be highlighted

The 'track by $index' is required, otherwise the directive does not work. If 
you have a filter it must be applied before the 'track by $index', as follows,
otherwise the filter will not be applied:

      <tbody ng-repeat="item in quotes | filter:{ ticker: symbolID } track by $index" class="list">

*/
var fxApp = angular.module('pricing');

fxApp.directive('backgroundhighlighter', function($timeout) {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                scope.$watch(attrs.backgroundhighlighter, function(nv, ov) {
                    if (nv !== ov) {
                        var newclass = nv < ov ? 'highlight-red' : 'highlight-green';

                        // apply class
                        element.addClass(newclass);

                        // auto remove after some delay
                        $timeout(function() {
                            element.removeClass(newclass);
                        }, 1000);
                    }
                });
            }
        };
    });

fxApp.directive('texthighlighter', function($timeout) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            scope.$watch(attrs.texthighlighter, function(nv, ov) {
                if (nv !== ov) {
                    var newclass = nv < ov ? 'highlight-text-red' : 'highlight-text-green';

                    // apply class
                    element.addClass(newclass);

                    // auto remove after some delay
                    $timeout(function() {
                        element.removeClass(newclass);
                    }, 1000);
                }
            });
        }
    };
});
