angular.module('aeonPocket').controller('walletHomeCtrl', [
    '$scope', '$mdToast', '$mdDialog', '$q', 'walletService', 'cryptonatorService',
    function ($scope, $mdToast, $mdDialog, $q, walletService, cryptonatorService) {

        $scope.isDialogOpen = false;

        $scope.showSyncDialog = function () {
            if (!$scope.isDialogOpen) {
                $mdDialog.show({
                    templateUrl: 'templates/views/partials/dialogs/syncDialog.html',
                    locals: {
                        wallet: $scope.wallet
                    },
                    controller: ['$scope', 'wallet', function ($scope, wallet) {
                        $scope.wallet = wallet;
                    }]
                });
                $scope.isDialogOpen = true;
            }
        }

        $scope.hideSyncDialog = function () {
            $mdDialog.cancel();
            $scope.isDialogOpen = false;
        }

        $scope.processTx = function (txHash) {
            var deferred = $q.defer();
            walletService.getTransaction({
                txHash: txHash
            }).then(function(data) {
                var wallet = $scope.getWallet();

                var updateWalletReq = {
                    address: wallet.public_addr,
                    viewKey: wallet.view.sec,
                    txid: data.txHash,
                    outputs: []
                };

                for (var i in data.outputs) {
                    var keyImage = generate_key_image(data.txExtraPub, wallet.view.sec, wallet.spend.pub, wallet.spend.sec, i);
                    if (keyImage.ephemeral_pub === data.outputs[i].key) {
                        updateWalletReq.outputs.push({
                            index: i,
                            keyImage: keyImage.key_image
                        });
                    }
                }

                return walletService.updateWallet(updateWalletReq);
            }).then(function(data) {
                deferred.resolve(data);
            }).catch(function(data) {
                deferred.reject(data);
            });
            return deferred.promise;
        }

        $scope.processTxs = function (txHashes, index) {
            if (index < txHashes.length) {
                $scope.processTx(txHashes[index]).then(function(resp) {
                    $scope.processTxs(txHashes, index + 1);
                }).catch(function(data) {
                    $mdToast.show('Sync failed.');
                });
            } else {
                $scope.refresh();
            }
        }

        $scope.refresh = function() {
            var request = {
                address: $scope.getWallet().public_addr,
                viewKey: $scope.getWallet().view.sec
            };

            $scope.showSyncDialog();
            walletService.refresh(request).then(function(data) {
                $scope.setWalletParam('syncHeight', data.syncHeight);
                $scope.setWalletParam('blockHeight', data.blockHeight);

                if (data.txHashes && data.txHashes.length > 0) {
                    $scope.processTxs(data.txHashes, 0);
                } else {
                    $scope.init();
                }
            }, function (data) {
                $scope.hideSyncDialog();
                $mdToast.show($mdToast.simple().textContent(data.message));
            });
        }

        $scope.showTransactionHelp = function () {
            $mdDialog.show(
                $mdDialog.alert()
                    .title("Past Transactions")
                    .htmlContent("We sync wallet from the time it was created on our platform.<br/>" +
                        "Hence, you will be able to view only your future transactions here.")
                    .ok("Got it")
            )
        }

        $scope.openImportDialog = function () {
            $mdDialog.show({
                templateUrl: 'templates/views/partials/dialogs/importDialog.html',
                locals: {
                    wallet: $scope.wallet,
                    refresh: $scope.refresh,
                    setWalletParam: $scope.setWalletParam
                },
                controller: [
                    '$scope', '$mdDialog', '$mdToast', 'walletService', 'wallet', 'refresh', 'setWalletParam',
                    function ($scope, $mdDialog, $mdToast, walletService, wallet, refresh, setWalletParam) {

                        $scope.boundary = {};
                        $scope.data = {};

                        $scope.reset = function () {
                            if ($scope.resetWalletForm.$invalid) {
                                $scope.resetWalletForm.$setSubmitted();
                                return;
                            }

                            walletService.resetWallet($scope.data).then(function (data) {
                                setWalletParam('syncHeight', data.syncHeight);
                                $mdDialog.hide();
                                refresh();
                            }, function (data) {
                                $mdToast.show($mdToast.simple().textContent(data.message));
                            })
                        };

                        $scope.close = function () {
                            $mdDialog.cancel();
                        };

                        $scope.init = function () {
                            var now = new Date();
                            now.setHours(0);
                            now.setMinutes(0);
                            now.setSeconds(0);
                            now.setMilliseconds(0);
                            var minDate = new Date(now.getTime() - 90*24*60*60*1000);

                            $scope.boundary.minDate = minDate;
                            $scope.boundary.maxDate = now;
                        };

                        $scope.init();
                    }
                ]
            })
        }

        $scope.init = function () {
            $scope.errorMessage = null;
            $scope.hideSyncDialog();

            var request = {
                address: $scope.getWallet().public_addr,
                viewKey: $scope.getWallet().view.sec
            };

            walletService.getTransactions(request).then(function(data) {
                if (data.status === 'success') {
                    $scope.transactions = data.transfers;
                } else {
                    $scope.errorMessage = data.message;
                }
            });

            walletService.getBalance(request).then(function(data) {
                $scope.setWalletParam('balance', data.balance);
                $scope.setWalletParam('syncHeight', data.syncHeight);
                $scope.setWalletParam('blockHeight', data.blockHeight);
            });

            cryptonatorService.getUsdRate().then(function (data) {
                $scope.setExchangeParam('USD', parseFloat(data.ticker.price).toFixed(2));
            });

            cryptonatorService.getEurRate().then(function (data) {
                $scope.setExchangeParam('EUR', parseFloat(data.ticker.price).toFixed(2));
            });

            if ($scope.getIntervalId() == null) {
                $scope.setIntervalId(setInterval(function () {
                    $scope.refresh();
                }, 30*60*1000));
                $scope.refresh();
            }
        }

        $scope.init();
    }
])