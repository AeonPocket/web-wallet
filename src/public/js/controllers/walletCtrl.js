angular.module('aeonPocket').controller('walletCtrl', [
    '$scope', '$state', '$mdSidenav', 'walletService', 'userService',
    function ($scope, $state, $mdSidenav, walletService, userService) {

        $scope.wallet = {};
        $scope.exchange = {};

        $scope.setWalletParam = function (key, value) {
            $scope.wallet[key] = value;
        }

        $scope.setExchangeParam = function (key, value) {
            $scope.exchange[key] = value;
        }

        $scope.toggleSideNav = function() {
            $mdSidenav('left').toggle();
        }

        $scope.go = function(toState) {
            $state.go(toState);
            $mdSidenav('left').close();
        }

        $scope.logout = function () {
            userService.logout().then(function() {
                localStorage.clear();
                $scope.clearWallet();
                $state.go('home');
            });

            if ($scope.getIntervalId() != null) {
                clearInterval($scope.getIntervalId());
                $scope.setIntervalId(null);
            }
        }

        $scope.init = function () {
            $scope.wallet.address = localStorage.getItem('address');
        }

        $scope.init();
    }
]);