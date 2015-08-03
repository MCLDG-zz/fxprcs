var fxApp = angular.module('pricing');

fxApp.controller('LoginCtrl', function($scope, $rootScope, $state, AUTH_EVENTS, AuthService) {
    $scope.credentials = {
        useremail: '',
        password: ''
    };

    $scope.loginResult = null;

    $scope.login = function(credentials) {
        AuthService.login(credentials)
            .then(function(user) {
                if (user == "Failed") {
                    $scope.loginResult = "Login Failed!";
                    $rootScope.$broadcast(AUTH_EVENTS.loginFailed);
                }
                else {
                    $scope.loginResult = null;
                    $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
                    $scope.setCurrentUser(user);
                    $state.go('watchlist', {});
                }
            });
    }
})