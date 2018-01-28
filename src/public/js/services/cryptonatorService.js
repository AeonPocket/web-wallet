angular.module('aeonPocket').service('cryptonatorService', [
    '$http', '$q',
    function ($http, $q) {

        this.getUsdRate = function() {
            var deferred = $q.defer();
            $http({
                method: 'GET',
                url: 'https://api.cryptonator.com/api/ticker/aeon-usd'
            }).then(function (resp) {
                deferred.resolve(resp.data);
            }, function (resp) {
                deferred.reject(resp.data);
            });
            return deferred.promise;
        }

        this.getEurRate = function() {
            var deferred = $q.defer();
            $http({
                method: 'GET',
                url: 'https://api.cryptonator.com/api/ticker/aeon-eur'
            }).then(function (resp) {
                deferred.resolve(resp.data);
            }, function (resp) {
                deferred.reject(resp.data);
            });
            return deferred.promise;
        }

    }
]);