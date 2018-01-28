<html lang="en" >
<head>
    <meta charset="UTF-8" />
    <meta name="theme-color" content="#16444f" />
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>AEON Pocket</title>
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet"/>

    <!-- htmlmin:ignore -->
    <link rel="stylesheet" href="bower_components/angular-material/angular-material.min.css">
    <link rel="stylesheet" href="css/app.css">
    <script src="bower_components/angular/angular.min.js"></script>
    <script src="bower_components/angular-animate/angular-animate.min.js"></script>
    <script src="bower_components/angular-aria/angular-aria.min.js"></script>
    <script src="bower_components/angular-messages/angular-messages.min.js"></script>
    <script src="bower_components/angular-material/angular-material.min.js"></script>
    <script src="bower_components/angular-sanitize/angular-sanitize.min.js"></script>
    <script src="bower_components/angular-ui-router/release/angular-ui-router.min.js"></script>
    <script src="bower_components/angular-ui-router/release/stateEvents.min.js"></script>
    <script src="bower_components/angular-loading-bar/build/loading-bar.min.js"></script>
    <script src="bower_components/qrcode-generator/js/qrcode.js"></script>
    <script src="bower_components/qrcode-generator/js/qrcode_UTF8.js"></script>
    <script src="bower_components/angular-qrcode/angular-qrcode.js"></script>
    <!-- htmlmin:ignore -->

    <!-- libraries -->
    <script src="js/lib/JSBigInt.js"></script>
    <script src="js/lib/cnBase58.js"></script>
    <!-- htmlmin:ignore -->
    <script src="js/lib/module.js"></script>
    <!-- htmlmin:ignore -->
    <script src="js/lib/config.js"></script>
    <script src="js/lib/cnUtilGen.js"></script>
    <script src="js/lib/mnemonic.js"></script>
    <script src="js/lib/nacl-fast-cn.js"></script>
    <script src="js/lib/sha3.js"></script>

    <!--Config file-->
    <script src="js/app.js"></script>

    <!--Controllers-->
    <script src="js/controllers/loginCtrl.js"></script>
    <script src="js/controllers/registerCtrl.js"></script>
    <script src="js/controllers/walletCtrl.js"></script>
    <script src="js/controllers/walletHomeCtrl.js"></script>
    <script src="js/controllers/walletSendCtrl.js"></script>
    <script src="js/controllers/walletReceiveCtrl.js"></script>
    <script src="js/controllers/walletReviewAccountCtrl.js"></script>

    <!--Services-->
    <script src="js/services/userService.js"></script>
    <script src="js/services/walletService.js"></script>
    <script src="js/services/cryptonatorService.js"></script>

    <link rel="shortcut icon" href="images/aeon_pocket_logo.png" type="image/ico">
</head>
<body ng-app="aeonPocket" ng-cloak layout="column">
<!--Progress bar to show ongoing API call-->
<md-progress-linear ng-class='{hide: (!inProgress)}' md-mode="indeterminate"></md-progress-linear>

<!--View container-->
<div layout="column" flex ui-view></div>

<!--Message to show if JS is disabled on client's machine.-->
<noscript>
    <h3 class="text-center">
        Our sites uses JavaScript.<br/>
        Please enable JavaScript and reload.
    </h3>
</noscript>
</body>
</html>