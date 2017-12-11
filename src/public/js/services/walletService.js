angular.module('aeonPocket').service('walletService', [
    '$http', '$q',
    function ($http, $q) {

        this.getBalance = function() {
            var deferred = $q.defer();
            $http({
                method: 'GET',
                url: '/api/v1/wallet/balance'
            }).then(function (resp) {
                deferred.resolve(resp.data);
            }, function (resp) {
                deferred.reject(resp.data);
            });
            return deferred.promise;
        }

        this.getTransactions = function() {
            var deferred = $q.defer();
            $http({
                method: 'GET',
                url: '/api/v1/wallet/transactions'
            }).then(function (resp) {
                deferred.resolve(resp.data);
            }, function (resp) {
                deferred.reject(resp.data);
            });
            return deferred.promise;
        }

        this.refresh = function() {
            var deferred = $q.defer();
            $http({
                method: 'POST',
                url: '/api/v1/wallet/refresh'
            }).then(function (resp) {
                deferred.resolve(resp.data);
            }, function (resp) {
                deferred.reject(resp.data);
            });
            return deferred.promise;
        }

        this.getKeys = function() {
            var deferred = $q.defer();
            $http({
                method: 'GET',
                url: '/api/v1/wallet/keys'
            }).then(function (resp) {
                deferred.resolve(resp.data);
            }, function (resp) {
                deferred.reject(resp.data);
            });
            return deferred.promise;
        }

        this.transfer = function(data) {
            var deferred = $q.defer();
            $http({
                method: 'POST',
                url: '/api/v1/wallet/transfer',
                data: data
            }).then(function (resp) {
                deferred.resolve(resp.data);
            }, function (resp) {
                deferred.reject(resp.data);
            });
            return deferred.promise;
        }

    }
]);