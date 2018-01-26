angular.module('aeonPocket').service('walletService', [
    '$http', '$q',
    function ($http, $q) {

        this.getBalance = function(data) {
            var deferred = $q.defer();
            $http({
                method: 'POST',
                url: '/api/v1/wallet/balance',
                data: data
            }).then(function (resp) {
                deferred.resolve(resp.data);
            }, function (resp) {
                deferred.reject(resp.data);
            });
            return deferred.promise;
        }

        this.getTransactions = function(data) {
            var deferred = $q.defer();
            $http({
                method: 'POST',
                url: '/api/v1/wallet/transactions',
                data: data
            }).then(function (resp) {
                deferred.resolve(resp.data);
            }, function (resp) {
                deferred.reject(resp.data);
            });
            return deferred.promise;
        }

        this.refresh = function(data) {
            var deferred = $q.defer();
            $http({
                method: 'POST',
                url: '/api/v1/wallet/refresh',
                data: data
            }).then(function (resp) {
                deferred.resolve(resp.data);
            }, function (resp) {
                deferred.reject(resp.data);
            });
            return deferred.promise;
        }

        this.getTransaction = function(data) {
            var deferred = $q.defer();
            $http({
                method: 'POST',
                url: '/api/v1/wallet/getTransaction',
                data: data
            }).then(function (resp) {
                deferred.resolve(resp.data);
            }, function (resp) {
                deferred.reject(resp.data);
            });
            return deferred.promise;
        }

        this.updateWallet = function(data) {
            var deferred = $q.defer();
            $http({
                method: 'POST',
                url: '/api/v1/wallet/updateWallet',
                data: data
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

        this.sendTransaction = function(data) {
            var deferred = $q.defer();
            $http({
                method: 'POST',
                url: '/api/v1/wallet/sendTransaction',
                data: data
            }).then(function (resp) {
                deferred.resolve(resp.data);
            }, function (resp) {
                deferred.reject(resp.data);
            });
            return deferred.promise;
        }

        this.deleteWallet = function(data) {
            var deferred = $q.defer();
            $http({
                method: 'POST',
                url: '/api/v1/wallet/deleteWallet',
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