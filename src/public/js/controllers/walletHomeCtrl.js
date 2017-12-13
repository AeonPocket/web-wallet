angular.module('aeonPocket').controller('walletHomeCtrl', [
    '$scope', '$mdToast', 'walletService',
    function ($scope, $mdToast, walletService) {

        $scope.refresh = function() {
            walletService.refresh().then(function() {
                $scope.init();
            }, function (data) {
                $mdToast.show($mdToast.simple().textContent(data.message));
            });
        }

        $scope.init = function () {
            $scope.errorMessage = null;
            walletService.getTransactions().then(function(data) {
                if (data.status === 'success') {
                    $scope.transactions = data.transfers;
                } else {
                    $scope.errorMessage = data.message;
                }
            });

            walletService.getBalance().then(function(data) {
                $scope.setWalletParam('balance', data.balance);
            });
        }

        $scope.init();
    }
])