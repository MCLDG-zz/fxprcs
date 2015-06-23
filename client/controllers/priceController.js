var app = angular.module('pricing');

app.directive('highlightOnChange', function() {
  return {
    link : function(scope, element, attrs) {
      attrs.$observe( 'highlightOnChange', function ( val ) {
        console.log("Highlighting", val);
        //element.effect('highlight');
        element.addClass('btn-danger');
      });
    }
  };
});

app.controller('priceController', function($scope, $timeout) {
  $scope.val = 1;
  $scope.updateVal = function() {
    $scope.val = $scope.val + 1;
  };
}); 