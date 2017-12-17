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

            var request = {
                address: $scope.getWallet().public_addr,
                viewKey: $scope.getWallet().view.sec,
                spendKey: $scope.getWallet().spend.sec
            }
            walletService.transfer(request).then(function(data) {
                $mdDialog.show(
                    $mdDialog.alert()
                        .title('AEON Sent Successfully')
                        .textContent("Your transfer request has been submitted successfully. Your transaction hash is" + data.tx_hash + ". \
                            A transaction takes about 10 to 20 minutes to process. You can use the above mentioned transaction hash \
                            to check if your transaction was successful.")
                )
            }, function (data) {
                $mdToast.show($mdToast.simple().textContent(data.message));
            })
        }
    }
]);