angular.module('aeonPocket').controller('registerCtrl', [
    '$scope', '$state', '$mdToast', 'userService',
    function ($scope, $state, $mdToast, userService) {
        
    $scope.step = 0;
        $scope.confirm = {};
        $scope.data = {};

        $scope.createNewWallet = function () {
            var seed = sc_reduce32(rand_32());
            var wallet = create_address(seed);
            var request = {
                address: wallet.public_addr,
                viewKey: wallet.view.sec
            };

            userService.create(request).then(function(data) {
                $scope.step = 2;
                $scope.seed = mn_encode(seed, 'electrum');
            });
        }

        $scope.register = function () {
            var wallet = create_address(mn_decode($scope.data.seed,'electrum'));
            var request = {
                address: wallet.public_addr,
                viewKey: wallet.view.sec
            }

            userService.create(request).then(function(data) {
                $mdToast.show($mdToast.simple('Account Created'));
                $state.go('login');
            }, function (data) {
                $mdToast.show($mdToast.simple(data.errors.address[0]));
            });
        }
        
        $scope.confirmSeed = function () {
            if ($scope.seed === $scope.confirm.seed) {
                $state.go('login');
            } else {
                $mdToast.show($mdToast.simple('Seed mismatch. Try again.'));
            }
        }
    }
]);