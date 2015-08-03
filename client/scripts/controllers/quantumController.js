var fxApp = angular.module('pricing');

fxApp.controller('quantumCtrl', ['$scope', '$http',
    function($scope, $http) {
        
        $scope.quantumFXOrders = [];
        $scope.quantumACOrders = [];
        
        $scope.loadQuantumFXOrders = function() {
            var httpReq = $http.get('/orders/quantumFXorder').
            success(function(data, status, headers, config) {
                $scope.quantumFXOrders = data;
            }).
            error(function(data, status, headers, config) {
                $scope.quantumFXOrders = {
                    "error retrieving Quantum FX orders": status
                };
            });
        };

        $scope.loadQuantumACOrders = function() {
            var httpReq = $http.get('/orders/quantumACorder').
            success(function(data, status, headers, config) {
                $scope.quantumACOrders = data;
            }).
            error(function(data, status, headers, config) {
                $scope.quantumACOrders = {
                    "error retrieving Quantum AC orders": status
                };
            });
        };
    }
]);
