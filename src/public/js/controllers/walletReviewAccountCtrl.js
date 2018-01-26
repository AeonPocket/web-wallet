angular.module('aeonPocket').controller('walletReviewAccountCtrl', [
    '$scope', '$mdDialog', '$mdToast', 'walletService',
    function ($scope, $mdDialog, $mdToast, walletService) {

        $scope.data = {
            address: $scope.getWallet().public_addr,
            viewKey: $scope.getWallet().view.sec,
            spendKey: $scope.getWallet().spend.sec,
            seed: $scope.getWallet().seed
        }

        $scope.deleteWallet = function () {
            $mdDialog.show(
                $mdDialog.confirm()
                    .title('Delete Wallet')
                    .textContent('Are you sure you want to delete your wallet from AEON Pocket?')
                    .ok('Yes')
                    .cancel('No')
            ).then(function () {
                walletService.deleteWallet({
                    address: $scope.getWallet().public_addr,
                    viewKey: $scope.getWallet().view.sec
                }).then(function () {
                    $mdToast.showSimple('Account Deleted');
                    $scope.logout();
                });
            })
        }
    }
])