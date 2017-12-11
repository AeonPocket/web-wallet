angular.module('aeonPocket').controller('walletReceiveCtrl', [
    '$scope',
    function ($scope) {

        $scope.randHex = function(len) {
            var maxlen = 8,
                min = Math.pow(16,Math.min(len,maxlen)-1)
            max = Math.pow(16,Math.min(len,maxlen)) - 1,
                n   = Math.floor( Math.random() * (max-min+1) ) + min,
                r   = n.toString(16);
            while ( r.length < len ) {
                r = r + $scope.randHex(len - maxlen);
            }
            return r;
        };

        $scope.receive = {
            address: localStorage.getItem('address'),
            paymentId: $scope.randHex(64),
            amount: 0
        };

        $scope.$watch('receive', function(receive) {
            var payementUrl = 'aeon:'+localStorage.getItem('address');
            payementUrl += (receive.paymentId)?('tx_payment_id='+receive.paymentId):'';
            payementUrl += (receive.amount)?('tx_amount='+receive.amount):'';
            $scope.paymentUrl = payementUrl;
        }, true)

    }
]);