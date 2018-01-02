angular.module('aeonPocket').controller('walletHomeCtrl', [
    '$scope', '$mdToast', '$mdDialog', '$q', 'walletService',
    function ($scope, $mdToast, $mdDialog, $q, walletService) {

        $scope.isDialogOpen = false;

        $scope.showSyncDialog = function () {
            if (!$scope.isDialogOpen) {
                $mdDialog.show({
                    templateUrl: 'templates/views/partials/dialogs/syncDialog.html'
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
            });
        }

        $scope.init();
    }
])