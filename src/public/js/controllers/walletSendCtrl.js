angular.module('aeonPocket').controller('walletSendCtrl', [
    '$scope', '$mdToast', '$mdDialog', 'walletService',
    function ($scope, $mdToast, $mdDialog, walletService) {

        $scope.feePerKb = config.feePerKb;
        $scope.fees = 10000000000;
        $scope.try = 0;

        $scope.send = {
            destinations: [{}]
        };

        $scope.remove = function (index) {
            $scope.send.destinations.splice(index,1);
        };
        
        $scope.calculateFee = function () {
            var balance = $scope.wallet.balance;

            if (balance*Math.pow(10,12) < ($scope.requiredAmount + $scope.fees)) {
                $mdToast.showSimple("Insufficient balance.");
                return;
            }

            $scope.try++;
            $mdDialog.show({
                template: '<div style="padding: 10px;">Calculating Fee... (' + $scope.try + ')</div>'
            });

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

                    var remainingAmount = sourceAmount - ($scope.requiredAmount + $scope.fees);
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

                    var rawTx = cnUtil.serialize_tx(signed);
                    var txBlob = new Blob(hextobin(rawTx));
                    var newFee = Number.parseInt(txBlob.size / 1024);
                    newFee += txBlob.size % 1024 ? 1 : 0;
                    newFee *= $scope.feePerKb;

                    console.log(newFee);

                    if ($scope.fees >= newFee) {
                        $scope.raw_tx_and_hash = {};
                        if (signed.version === 1) {
                            $scope.raw_tx_and_hash.raw = rawTx;
                            $scope.raw_tx_and_hash.hash = cnUtil.cn_fast_hash(rawTx);
                            $scope.raw_tx_and_hash.prvkey = signed.prvkey;
                            $scope.raw_tx_and_hash.signed = signed;

                            $scope.remainingAmount = remainingAmount;
                            $scope.inputAmount = 0;
                            for (var i in signed.vin) {
                                $scope.inputAmount += signed.vin[i].amount;
                            }
                        } else {
                            $scope.raw_tx_and_hash = cnUtil.serialize_rct_tx_with_hash(signed);
                        }

                        $mdDialog.hide();
                        $scope.confirmSend();
                    } else {
                        $scope.fees = newFee;
                        $scope.calculateFee();
                    }
                } catch (e) {
                    $mdDialog.show(
                        $mdDialog.alert()
                            .title("Error!")
                            .textContent(e)
                            .ok("OK")
                    );
                    return;
                }


            }, function (data) {
                $mdToast.show($mdToast.simple().textContent(data.message));
            });
        }

        $scope.confirmSend = function() {
            $mdDialog.show(
                $mdDialog.confirm()
                    .title('Are you sure you want to make this transaction?')
                    .htmlContent(
                        '<strong>Transaction ID:</strong> ' + $scope.raw_tx_and_hash.hash + '<br/>' +
                        '<strong>Private Key:</strong> ' + $scope.raw_tx_and_hash.prvkey + '<br/><br/>' +
                        '<strong>Input Amount:</strong> ' + ($scope.inputAmount / Math.pow(10, 12)).toFixed(12) + ' AEONs<br/>' +
                        '<strong>Miner\'s Fee:</strong> ' + ($scope.fees / Math.pow(10, 12)).toFixed(12) + ' AEONs<br/>' +
                        '<strong>You get back:</strong> ' + ($scope.remainingAmount / Math.pow(10, 12)).toFixed(12) + ' AEONs<br/><br/>' +
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
                                                A transaction takes about 30 minutes to process. You can use the above mentioned transaction hash \
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
        }

        $scope.submit = function () {
            if ($scope.sendForm.$invalid) {
                $scope.sendForm.$setSubmitted();
                return;
            }

            var requiredAmount = 0;

            for (var i in $scope.send.destinations) {
                requiredAmount += parseFloat($scope.send.destinations[i].amount)*Math.pow(10,12);

                if ($scope.send.destinations[i].address === localStorage.getItem('address')) {
                    $mdToast.show($mdToast.simple().textContent('You cannot send to yourself.'));
                    return;
                }
            }

            $scope.requiredAmount = requiredAmount

            $scope.send.address = $scope.getWallet().public_addr;
            $scope.send.viewKey = $scope.getWallet().view.sec;
            $scope.send.fee = 0;

            $scope.calculateFee();
        }
    }
]);