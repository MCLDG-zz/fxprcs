var fxApp = angular.module('pricing');

fxApp.service('Session', function () {
  this.create = function (emailID, usernameId, userRole) {
    this.emailID = emailID;
    this.usernameId = usernameId;
    this.userRole = userRole;
  };
  this.destroy = function () {
    this.emailID = null;
    this.usernameId = null;
    this.userRole = null;
  };
})