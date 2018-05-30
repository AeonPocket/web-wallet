angular.module('aeonPocket').controller('registerCtrl', [
    '$scope', '$state', '$mdToast', '$mdDialog', 'userService',
    function ($scope, $state, $mdToast, $mdDialog, userService) {
        
        $scope.step = 0;
        $scope.confirm = {};
        $scope.data = {};

        $scope.createNewWallet = function () {
            var seed = sc_reduce32(rand_32());

            $scope.step = 2;
            $scope.seed = mn_encode(seed, 'english');
        }

        $scope.register = function () {
            var wallet;
            if ($scope.data.seed.split(' ').length === 24) {
                wallet = create_address(mn_decode($scope.data.seed,'electrum'));
                var newSeed = mn_encode(wallet.spend.sec, 'english');
                $mdDialog.show(
                    $mdDialog.alert()
                        .title('Seed updated')
                        .htmlContent(
                            '<strong>You were using an old seed, which has been deprecated.<br/>' +
                            'Please note down your new 25 word seed.</strong><br/>' +
                            '<pre class="newSeed">' + newSeed + '</pre>')
                        .ok('Got it')
                );
            } else {
                wallet = create_address(mn_decode($scope.data.seed, 'english'));
            }

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
                var wallet = create_address(mn_decode($scope.seed,'english'));
                var request = {
                    address: wallet.public_addr,
                    viewKey: wallet.view.sec
                };
                userService.create(request).then(function(data) {
                    $mdToast.showSimple("Account Created");
                    $state.go('login');
                });
            } else {
                $mdToast.show($mdToast.simple('Seed mismatch. Try again.'));
            }
        }
    }
]);