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

            $scope.send.address = $scope.getWallet().public_addr;
            $scope.send.viewKey = $scope.getWallet().view.sec;

            walletService.transfer($scope.send).then(function(data) {
                try {
                    var signed = cnUtil.construct_tx(
                        $scope.getWallet(), data.sources,
                        $scope.send.destinations.map(function(item) {
                            item.amount = item.amount*Math.pow(10,12);
                            return item;
                        }),
                        10000000000, $scope.send.paymentId, false, null, 0, false
                    );

                    console.log(signed);

                    var raw_tx_and_hash = {};
                    if (signed.version === 1) {
                        raw_tx_and_hash.raw = cnUtil.serialize_tx(signed);
                        raw_tx_and_hash.hash = cnUtil.cn_fast_hash(cnUtil.serialize_tx(signed));
                        raw_tx_and_hash.prvkey = signed.prvkey;
                    } else {
                        raw_tx_and_hash = cnUtil.serialize_rct_tx_with_hash(signed);
                    }

                    console.log(raw_tx_and_hash);
                } catch (e) {
                    $mdDialog.alert()
                        .title("Error!")
                        .textContent(e)
                        .ok("OK")
                    return;
                }


            }, function (data) {
                $mdToast.show($mdToast.simple().textContent(data.message));
            })
        }
    }
]);