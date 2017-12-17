angular.module('aeonPocket').controller('walletReviewAccountCtrl', [
    '$scope', 'walletService',
    function ($scope, walletService) {

        $scope.data = {
            address: $scope.getWallet().public_addr,
            viewKey: $scope.getWallet().view.sec,
            spendKey: $scope.getWallet().spend.sec,
            seed: $scope.getWallet().seed
        }
    }
])