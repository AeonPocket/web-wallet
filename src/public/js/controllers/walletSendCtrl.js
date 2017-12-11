angular.module('aeonPocket').controller('walletSendCtrl', [
    '$scope', '$mdToast', '$mdDialog', 'walletService',
    function ($scope, $mdToast, $mdDialog, walletService) {
        $scope.send = {
            destinations: [{}]
        };

        $scope.remove = function (index) {
            $scope.send.destinations.splice(index,1);
        }

        $scope.submit = function () {
            if ($scope.sendForm.$invalid) {
                $scope.sendForm.$setSubmitted();
                return;
            }

            for (var i in $scope.send.destinations) {
                if ($scope.send.destinations[i].address === localStorage.getItem('address')) {
                    $mdToast.show($mdToast.simple().textContent('You cannot send to yourself.'));
                    return;
                }
            }

            walletService.transfer($scope.send).then(function(data) {

            }, function (data) {
                $mdToast.show($mdToast.simple().textContent(data.message));
            })
        }
    }
]);