/**
 * AeonPocket Module configuration.
 */
angular.module('aeonPocket', ['ui.router', 'ui.router.state.events', 'ngMaterial', 'angular-loading-bar', 'monospaced.qrcode'])
    .config(['$stateProvider', '$urlRouterProvider', '$mdThemingProvider','cfpLoadingBarProvider',
        function ($stateProvider, $urlRouterProvider, $mdThemingProvider, cfpLoadingBarProvider) {

            // Various States
            $stateProvider.state('home', {
                url: '/home',
                templateUrl: 'templates/views/home.html',
                data: {requireLogin: false}
            })
            .state('login', {
                url: '/login',
                templateUrl: 'templates/views/login.html',
                controller: 'loginCtrl',
                data: {requireLogin: false}
            })
            .state('register', {
                url: '/register',
                templateUrl: 'templates/views/register.html',
                controller: 'registerCtrl',
                data: {requireLogin: false}
            })
            .state('wallet', {
                url: '/wallet',
                templateUrl: 'templates/views/wallet.html',
                controller: 'walletCtrl',
                data: {requireLogin: true},
                redirectTo: 'wallet.home'
            })
            .state('wallet.home', {
                url: '/home',
                templateUrl: 'templates/views/wallet/home.html',
                controller: 'walletHomeCtrl',
                data: {requireLogin: true}
            })
            .state('wallet.send', {
                url: '/send',
                templateUrl: 'templates/views/wallet/send.html',
                controller: 'walletSendCtrl',
                data: {requireLogin: true}
            })
            .state('wallet.receive', {
                url: '/send',
                templateUrl: 'templates/views/wallet/receive.html',
                controller: 'walletReceiveCtrl',
                data: {requireLogin: true}
            })
            .state('wallet.reviewAccount', {
                url: '/reviewAccount',
                templateUrl: 'templates/views/wallet/reviewAccount.html',
                controller: 'walletReviewAccountCtrl',
                data: {requireLogin: true}
            });

            // Default page.
            $urlRouterProvider.otherwise('/home');

            // Theme config.
            $mdThemingProvider.definePalette('starSearchPalette', {
                '50': 'ffebee',
                '100': '201652',
                '200': 'ef9a9a',
                '300': 'ffffff',
                '400': '201652',
                '500': '16444f',
                '600': '2c88a0',
                '700': 'd32f2f',
                '800': '000000',
                '900': 'b71c1c',
                'A100': 'CE102C',
                'A200': 'ff5252',
                'A400': 'ff1744',
                'A700': 'd50000',
                'contrastDefaultColor': 'light',
                'contrastDarkColors': ['400', 'A100'],
                'contrastLightColors': undefined
            });
            $mdThemingProvider.theme('default')
                .primaryPalette('starSearchPalette');

            // Config for angular-loading-bar so that we can use
            // custom progress bar.
            cfpLoadingBarProvider.includeBar = false;
            cfpLoadingBarProvider.includeSpinner = false;
        }
    ])
    .run(['$rootScope', '$state', '$mdDialog', 'userService', function ($rootScope, $state, $mdDialog, userService) {

        /**
         * Variable to track if any api call is ongoing.
         * @type {boolean}
         */
        $rootScope.inProgress = false;

        /**
         * Variable to track number of api calls ongoing.
         * @type {number}
         */
        $rootScope.apiCount = 0;

        /**
         * Wallet Object. Set on login and kept completely in
         * memory for security.
         */
        $rootScope.wallet = null;

        /**
         * Getter for wallet.
         *
         * @returns {*|null}
         */
        $rootScope.getWallet = function() {
            return $rootScope.wallet;
        }

        /**
         * Setter for wallet.
         *
         * @param wallet
         */
        $rootScope.setWallet = function (wallet) {
            $rootScope.wallet = wallet;
        }

        /**
         * Clears the wallet object.
         */
        $rootScope.clearWallet = function () {
            $rootScope.wallet = null;
        }

        /**
         * Signals start of an api call.
         */
        $rootScope.showProgress = function() {
            $rootScope.inProgress = true;
            $rootScope.apiCount++;
        }

        /**
         * Signals end of an api call.
         * Resets apiCount variable if all calls are completed.
         * @Note: This works because JavaScript is single threaded.
         */
        $rootScope.hideProgress = function() {
            $rootScope.apiCount--;
            if ($rootScope.apiCount <= 0) {
                $rootScope.inProgress = false;
                $rootScope.apiCount = 0;
            }
        }

        /**
         * Checks if user is already logged in.
         * @returns {boolean}
         */
        $rootScope.isAuthorized = function() {
            return ($rootScope.getWallet() !== null);
        }

        /**
         * Event listener for state change start.
         */
        $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState) {

            // Authorization Check
            if (toState.data.requireLogin && !$rootScope.isAuthorized()) {
                // if login is required and user is unauthorized,
                // redirect to login page.
                event.preventDefault();
                $state.go('home');
                return;
            } else if (!toState.data.requireLogin && $rootScope.isAuthorized()) {
                // if page is for only guest user and user is logged in,
                // redirect to search page.
                event.preventDefault();
                $state.go('wallet');
                return;
            }

            // If is an intermediate state
            if (toState.redirectTo) {
                event.preventDefault();
                $state.go(toState.redirectTo, toParams, {location: 'replace'});
                return;
            }

            // Signals start of an api call to get view's template.
            $rootScope.showProgress();
        });

        /**
         * Event listener for state change complete.
         */
        $rootScope.$on('$viewContentLoaded', function(event){
            // Signals end of api call used for loading view's template.
            $rootScope.hideProgress();
        });

        /**
         * Event listener for api call start.
         */
        $rootScope.$on('cfpLoadingBar:started', function () {
            // Signals start of an api call.
            $rootScope.showProgress();
        });

        /**
         * Event listener of api call end.
         */
        $rootScope.$on('cfpLoadingBar:completed', function () {
            // Signals end of an api call.
            $rootScope.hideProgress();
        });
    }]);