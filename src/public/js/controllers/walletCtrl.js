angular.module('aeonPocket').controller('walletCtrl', [
    '$scope', '$state', '$mdSidenav', 'walletService', 'userService',
    function ($scope, $state, $mdSidenav, walletService, userService) {

        $scope.wallet = {};

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
                $state.go('login');
            });
        }

        $scope.init = function () {
            $scope.wallet.address = localStorage.getItem('address');
            walletService.getBalance().then(function(data) {
                $scope.wallet.balance = data.balance;
            });
        }

        $scope.init();
    }
]);