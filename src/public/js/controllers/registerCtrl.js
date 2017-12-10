angular.module('aeonPocket').controller('registerCtrl', [
    '$scope', '$state', '$mdToast', 'userService',
    function ($scope, $state, $mdToast, userService) {
        
    $scope.step = 0;
        $scope.confirm = {};
        $scope.data = {};

        $scope.createNewWallet = function () {
            userService.create().then(function(data) {
                $scope.step = 2;
                $scope.seed = data.seed;
            });
        }

        $scope.register = function () {
            userService.create($scope.data).then(function(data) {
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