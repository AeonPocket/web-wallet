angular.module('aeonPocket').controller('walletHomeCtrl', [
    '$scope', '$mdToast', 'walletService',
    function ($scope, $mdToast, walletService) {

        $scope.refresh = function() {
            var request = {
                address: $scope.getWallet().public_addr,
                viewKey: $scope.getWallet().view.sec,
                spendKey: $scope.getWallet().spend.sec
            };

            walletService.refresh(request).then(function() {
                $scope.init();
            }, function (data) {
                $mdToast.show($mdToast.simple().textContent(data.message));
            });
        }

        $scope.init = function () {
            $scope.errorMessage = null;

            var request = {
                address: $scope.getWallet().public_addr,
                viewKey: $scope.getWallet().view.sec
            };

            walletService.getTransactions(request).then(function(data) {
                if (data.status === 'success') {
                    $scope.transactions = data.transfers;
                } else {
                    $scope.errorMessage = data.message;
                }
            });

            walletService.getBalance(request).then(function(data) {
                $scope.setWalletParam('balance', data.balance);
            });
        }

        $scope.init();
    }
])