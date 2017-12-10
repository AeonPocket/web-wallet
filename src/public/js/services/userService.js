angular.module('aeonPocket').service('userService', [
    '$http', '$q',
    function ($http, $q) {

        this.login = function (data) {
            var deferred = $q.defer();
            $http({
                method: 'POST',
                url: '/api/v1/account/login',
                data: data
            }).then(function (resp) {
                deferred.resolve(resp.data);
            }, function (resp) {
                deferred.reject(resp.data);
            });
            return deferred.promise;
        }

        this.getAccount = function () {
            var deferred = $q.defer();
            $http({
                method: 'GET',
                url: '/api/v1/account/'
            }).then(function (resp) {
                deferred.resolve(resp.data);
            }, function (resp) {
                deferred.reject(resp.data);
            });
            return deferred.promise;
        }

        this.logout = function () {
            var deferred = $q.defer();
            $http({
                method: 'GET',
                url: '/api/v1/account/logout'
            }).then(function (resp) {
                deferred.resolve(resp.data);
            }, function (resp) {
                deferred.reject(resp.data);
            });
            return deferred.promise;
        }

        this.create = function(data) {
            var deferred = $q.defer();
            $http({
                method: 'POST',
                url: '/api/v1/wallet/create',
                data: data
            }).then(function (resp) {
                deferred.resolve(resp.data);
            }, function (resp) {
                deferred.reject(resp.data);
            });
            return deferred.promise;
        }
    }
])