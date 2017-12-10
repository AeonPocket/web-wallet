angular.module('aeonPocket').controller('loginCtrl', [
    '$scope', '$state', 'userService',
    function($scope, $state, userService) {
        
        $scope.data = {};
        
        $scope.login = function () {
            // resetting validation
            $scope.loginForm.seed.$setValidity('validation', true);

            // Checks if form is invalid. If invalid, it terminates.
            if ($scope.loginForm.$invalid) {
                $scope.loginForm.$setSubmitted();
                return;
            }

            // Call Login API and redirect user / show appropriate error.
            userService.login($scope.data).then(function(data) {
                localStorage.setItem('address', data.address);
                $state.go('wallet');
            }, function (data) {
                $scope.loginForm.seed.$setValidity('validation', false);
                $scope.errorMessage = data.message;
            });

        }
    
    }
]);