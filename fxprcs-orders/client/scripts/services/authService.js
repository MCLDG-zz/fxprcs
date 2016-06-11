var fxApp = angular.module('pricing');

fxApp.factory('AuthService', function ($http, Session) {
  var authService = {};
 
  authService.login = function (credentials) {
    return $http
      .post('/login/auth', credentials)
      .then(function (res) {
          //check whether login was successful
          if (res.data.msg == "Success") {
                Session.create(res.data.email, res.data.username,
                       res.data.role);
                return res.data.username;
          }
          else {
              return res.data.msg;
          }
      });
  };
 
  authService.isAuthenticated = function () {
    return !!Session.userId;
  };
 
  authService.isAuthorized = function (authorizedRoles) {
    if (!angular.isArray(authorizedRoles)) {
      authorizedRoles = [authorizedRoles];
    }
    return (authService.isAuthenticated() &&
      authorizedRoles.indexOf(Session.userRole) !== -1);
  };
 
  return authService;
})