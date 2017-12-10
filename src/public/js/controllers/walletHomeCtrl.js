angular.module('aeonPocket').controller('walletHomeCtrl', [
    '$scope', 'walletService',
    function ($scope, walletService) {

        $scope.init = function () {
            walletService.getTransactions().then(function(data) {
                if (data.status === 'Success') {

                } else {
                    $scope.errorMessage = data.message;
                }
            });
        }

        $scope.init();
    }
])