angular.module('aeonPocket').controller('walletSendCtrl', [
    '$scope', '$mdToast', '$mdDialog', 'walletService',
    function ($scope, $mdToast, $mdDialog, walletService) {

        $scope.fees = 10000000000;
        $scope.feesParsed = ($scope.fees/Math.pow(10,12)).toFixed(12);

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

            var requiredAmount = 0;
            var balance = $scope.wallet.balance;

            for (var i in $scope.send.destinations) {
                requiredAmount += parseFloat($scope.send.destinations[i].amount)*Math.pow(10,12);

                if ($scope.send.destinations[i].address === localStorage.getItem('address')) {
                    $mdToast.show($mdToast.simple().textContent('You cannot send to yourself.'));
                    return;
                }
            }

            if (balance*Math.pow(10,12) < (requiredAmount+$scope.fees)) {
                $mdToast.showSimple("Insufficient balance.");
                return;
            }

            $scope.send.address = $scope.getWallet().public_addr;
            $scope.send.viewKey = $scope.getWallet().view.sec;

            walletService.transfer($scope.send).then(function(data) {
                try {
                    var dsts = $scope.send.destinations.map(function(item) {
                        var dest = {};
                        dest.amount = parseFloat(item.amount)*Math.pow(10,12);
                        dest.address = item.address;
                        return dest;
                    });

                    var sourceAmount = 0;
                    for (var i in data.sources) {
                        sourceAmount += data.sources[i].amount;
                    }

                    var remainingAmount = sourceAmount - (requiredAmount + $scope.fees);
                    if (remainingAmount > 0) {
                        dsts.push({
                            address: $scope.getWallet().public_addr,
                            amount: remainingAmount
                        });
                    }

                    var signed = cnUtil.construct_tx(
                        $scope.getWallet(), data.sources,
                        cnUtil.decompose_tx_destinations(dsts),
                        $scope.fees, $scope.send.paymentId,
                        false, null, 0, false
                    );

                    console.log(signed);

                    $scope.raw_tx_and_hash = {};
                    if (signed.version === 1) {
                        $scope.raw_tx_and_hash.raw = cnUtil.serialize_tx(signed);
                        $scope.raw_tx_and_hash.hash = cnUtil.cn_fast_hash(cnUtil.serialize_tx(signed));
                        $scope.raw_tx_and_hash.prvkey = signed.prvkey;
                        $scope.raw_tx_and_hash.signed = signed;
                    } else {
                        $scope.raw_tx_and_hash = cnUtil.serialize_rct_tx_with_hash(signed);
                    }

                    console.log($scope.raw_tx_and_hash);
                } catch (e) {
                    $mdDialog.show(
                        $mdDialog.alert()
                            .title("Error!")
                            .textContent(e)
                            .ok("OK")
                    );
                    return;
                }

                $mdDialog.show(
                    $mdDialog.confirm()
                        .title('Are you sure you want to make this transaction?')
                        .htmlContent(
                            '<strong>Transaction ID:</strong> ' + $scope.raw_tx_and_hash.hash + '<br/>' +
                            '<strong>Private Key:</strong> ' + $scope.raw_tx_and_hash.prvkey + '<br/>' +
                            '<strong>Transaction Description:</strong><br/><pre>' + JSON.stringify($scope.raw_tx_and_hash.signed, null, 4) + '</pre>')
                        .ok('Yes')
                        .cancel('No')
                ).then(function () {
                    walletService.sendTransaction({
                        txHex: $scope.raw_tx_and_hash.raw
                    }).then(function (data) {
                        if (data.status == 'OK') {
                            $mdDialog.show(
                                $mdDialog.alert()
                                    .title('AEON Sent Successfully')
                                    .textContent("Your transfer request has been submitted successfully. Your transaction hash is " + $scope.raw_tx_and_hash.hash + ". \
                                                A transaction takes about 10 to 20 minutes to process. You can use the above mentioned transaction hash \
                                                to check if your transaction was successful.")
                                    .ok('OK')
                            );

                            $scope.send = {
                                destinations: [{}]
                            };
                        } else {
                            $mdDialog.show(
                                $mdDialog.alert()
                                    .title("Error!")
                                    .textContent("Transaction with hash " + $scope.raw_tx_and_hash.hash + " was rejected by daemon. \
                                            Please sync the wallet and try again after sometime.")
                                    .ok("OK")
                            );
                        }
                    }, function (data) {
                        $mdToast.show($mdToast.simple().textContent(data.message));
                    });
                });
            }, function (data) {
                $mdToast.show($mdToast.simple().textContent(data.message));
            })
        }
    }
]);