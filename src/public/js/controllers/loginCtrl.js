angular.module('aeonPocket').controller('loginCtrl', [
    '$scope', '$state', '$mdDialog', 'userService',
    function($scope, $state, $mdDialog, userService) {
        
        $scope.data = {};
        
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
                localStorage.setItem('address', data.address);
                $scope.setWallet(wallet);
                $state.go('wallet');
            }, function (data) {
                $scope.loginForm.seed.$setValidity('validation', false);
                $scope.errorMessage = data.message;
            });

        }
    
    }
]);