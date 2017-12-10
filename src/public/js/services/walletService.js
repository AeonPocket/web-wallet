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

    }
]);