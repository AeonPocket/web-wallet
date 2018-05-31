angular.module('aeonPocket').controller('loginCtrl', [
    '$scope', '$state', '$mdDialog', 'userService',
    function($scope, $state, $mdDialog, userService) {
        
        $scope.data = {};
        $scope.viewWallet = {};
        
        $scope.login = function () {
            // resetting validation
            $scope.loginForm.seed.$setValidity('validation', true);

            // Checks if form is invalid. If invalid, it terminates.
            if ($scope.loginForm.$invalid) {
                $scope.loginForm.$setSubmitted();
                return;
            }

            var wallet;

            if ($scope.data.seed.split(' ').length === 24) {
                wallet = create_address(mn_decode($scope.data.seed,'electrum'));
                var newSeed = mn_encode(wallet.spend.sec, 'english');
                $mdDialog.show(
                    $mdDialog.alert()
                        .title('Seed updated')
                        .htmlContent(
                            '<strong>You were using an old seed, which has been deprecated.<br/>' +
                            'Please note down your new 25 word seed.<br/>' +
                            'Use your new seed to login.</strong><br/>' +
                            '<pre class="newSeed">' + newSeed + '</pre>')
                        .ok('Got it')
                );
                return;
            } else {
                wallet = create_address(mn_decode($scope.data.seed,'english'));
            }

            wallet.seed = $scope.data.seed;

            var request = {
                address: wallet.public_addr,
                viewKey: wallet.view.sec
            };

            // Call Login API and redirect user / show appropriate error.
            userService.login(request).then(function(data) {
                if (data.viewOnly) {
                    $mdDialog.show(
                        $mdDialog.alert()
                            .title('Error')
                            .htmlContent('The wallet for the given seed is created as a view only wallet.<br/>' +
                                'Please, delete the view only wallet and then register a new wallet using your seed.<br/>' +
                                'This is required to avoid key image corruption.<br/><br/>' +
                                '<strong>Note:</strong> All you past transaction will be removed from our database when you delete your ' +
                                'existing wallet.')
                            .ok('Got it!')
                    );
                } else {
                    localStorage.setItem('address', data.address);
                    wallet.reset = data.reset;
                    $scope.setWallet(wallet);
                    $state.go('wallet');
                }
            }, function (data) {
                $scope.loginForm.seed.$setValidity('validation', false);
                $scope.errorMessage = data.message;
            });

        }

        $scope.loginViewOnlyWallet = function () {
            var wallet = {
                public_addr: $scope.viewWallet.address,
                view: generate_keys($scope.viewWallet.viewKey),
                spend: generate_keys("0000000000000000000000000000000000000000000000000000000000000000")
            }

            wallet.spend.pub = decode_address($scope.viewWallet.address).spend;
            // Call Login API and redirect user / show appropriate error.
            userService.login($scope.viewWallet).then(function(data) {
                if (data.viewOnly) {
                    localStorage.setItem('address', data.address);
                    wallet.reset = data.reset;
                    $scope.setWallet(wallet);
                    $state.go('wallet');
                } else {
                    $mdDialog.show(
                        $mdDialog.alert()
                            .title('Error')
                            .htmlContent('The wallet entered was created using seed.<br/>' +
                                'Please, delete the wallet and then register a new view only wallet.<br/>' +
                                'This is required to avoid key image corruption.<br/><br/>' +
                                '<strong>Note:</strong> All you past transaction will be removed from our database when you delete your ' +
                                'existing wallet.')
                            .ok('Got it!')
                    );
                }
            }, function (data) {
                $scope.viewWalletForm.address.$setValidity('validation', false);
                $scope.errorMessage = data.message;
            });
        }
    
    }
]);