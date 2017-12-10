angular.module('aeonPocket').controller('walletReviewAccountCtrl', [
    '$scope', 'walletService',
    function ($scope, walletService) {
        $scope.init = function () {
            walletService.getKeys().then(function(data) {
                $scope.data = data;
            });
        }

        $scope.init();
    }
])