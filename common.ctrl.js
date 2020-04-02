(function (app) {
    'use strict';



    // ROOT CONTROLLER
    app.controller('rootCtrl', rootCtrl);
    rootCtrl.$inject = ['$timeout', '$state', '$scope', '$rootScope', 'authService', 'Idle', '$stateParams', 'appSettings', 'adalAuthenticationService', '$location', '$window', 'stateMgmtService', 'featureMgmtService', '$modalStack'];

    function rootCtrl($timeout, $state, $scope, $rootScope, authService, Idle, $stateParams, appSettings, adalService, $location, $window, stateMgmtService, featureMgmtService, $modalStack) {

        var ctrl = this;

        this.navigationItems = [];
        this.operationalNavigations = [];
        this.navigationHtmlPath = appSettings.currentNavigation;
        this.isCMDActive = false;
        $scope.toggle = true;
        this.relativityDashNavigations = [];
        this.caseManagementDashNavigations = [];

        ctrl.appName = $rootScope.appName;
               
        $scope.onBrowserClose = function (event) {
            authService.InValidateUserSession();
        };
        //Invalidate the current session of the user on browser close
        $window.onbeforeunload = $scope.onBrowserClose;

        // Detact Mobile Browser
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
            angular.element('html').addClass('ismobile');
        }

        // By default Sidbars are hidden in boxed layout and in wide layout only the right sidebar is hidden.
        this.sidebarToggle = {
            left: false
        }

        // By default template has a boxed layout
        this.layoutType = localStorage.getItem('ma-layout-status');

        // For Mainmenu Active Class !important for active toggle on navigation
        this.$state = $state;

        //Close sidebar on click
        this.sidebarStat = function (event, feature, defType, title) {
            if (!angular.element(event.target).parent().hasClass('active')) {
                this.sidebarToggle.left = false;
            }
            authService.actionTag = angular.element(event.target).context.parentNode.innerText;

            stateMgmtService.removePageParams();

            if (feature && feature === 'HOME') {
                if ($rootScope.isModuleSelected(ctrl.moduleIdRouteId)) {
                    $state.go('module.home', { module_id: ctrl.moduleIdRouteId, defType: 'home' });
                } else {
                    $state.go('home.index');
                }
            } else if (feature && feature === 'ADMIN_USER_ACCESS') {
                $state.go('admin.user-access', { module_id: ctrl.moduleIdRouteId });
            } else if (feature && feature === 'ADMIN_FEATURE_CONFIG') {
                $state.go('admin.feature-mgmt.index', { module_id: ctrl.moduleIdRouteId });
            } else if (feature && feature === 'ADMIN_ROLE_MANAGEMENT') {
                $state.go('admin.role-mgmt.index', { module_id: ctrl.moduleIdRouteId });
            } else if (feature && feature === 'ADMIN_METADATA_MANAGEMENT') {
                $state.go('admin.metadata-mgmt.download', { module_id: ctrl.moduleIdRouteId });
            } else if (feature && feature === 'SETUP_GENERAL_CONFIG') {
                $state.go('setup.general-configuration.index', { module_id: ctrl.moduleIdRouteId });
            } else if (feature && feature === 'SETUP_NAVIGATION_MGMT') {
                $state.go('setup.navigation-mgmt.index', { module_id: ctrl.moduleIdRouteId });
            } else if (feature && feature === 'SETUP_NOTIFICATION') {
                $state.go('setup.template-notification-mgmt.index', { module_id: ctrl.moduleIdRouteId });
            } else if (feature && feature === 'SETUP_DATAPIPELINE') {
                $state.go('setup.udm-mgmt.index', { module_id: ctrl.moduleIdRouteId });
            } else if (feature && feature === 'SETUP_CALCULATION') {
                $state.go('setup.calculate-mgmt.index', { module_id: ctrl.moduleIdRouteId });
            } else if (feature && feature === 'SETUP_DYNAMICSCREENS') {
                $state.go('setup.dynamicscreen-mgmt.index', { module_id: ctrl.moduleIdRouteId });
            } else if (feature && feature === 'SETUP_DYNAMICWORKFLOW') {
                $state.go('setup.dynamicworkflow-mgmt.index', { module_id: ctrl.moduleIdRouteId });
            } else if (feature && feature === 'SETUP_REPORTS') {
                $state.go('setup.report-mgmt.index', { module_id: ctrl.moduleIdRouteId });
            } else if (feature && feature === 'SETUP_DASHBOARD') {
                $state.go('setup.dashboard-mgmt.index', { module_id: ctrl.moduleIdRouteId });
            } else if (feature && feature === 'DATAPIPELINE_DEFINE') {
                $state.go('udm.udm-pipeline', { module_id: ctrl.moduleIdRouteId });
            } else if (feature && feature === 'DATAPIPELINE_EXECUTE') {
                $state.go('udm.exec-pipeline', { module_id: ctrl.moduleIdRouteId });
            } else if (feature && feature === 'DATAPIPELINE_SAMPLESELECTION') {
                $state.go('udm.udm-data-sample', { module_id: ctrl.moduleIdRouteId });
            } else if (feature && feature === 'REPORTMGMT_DEFINE') {
                $state.go('report-management.reports', { module_id: ctrl.moduleIdRouteId });
            } else if (feature && feature === 'REPORTMGMT_DASHBOARD') {
                $state.go('report-management.dashboard', { module_id: ctrl.moduleIdRouteId });
            } else if (feature && feature === 'DYNAMIC_MENU' && defType) {
                $state.go('module.home', { module_id: ctrl.moduleIdRouteId, defType: defType, level: '0', title: title });
            } else if (feature && feature === 'SETUP_CONFIGURATIONQUERIES') {
                $state.go('setup.configuration-queries.index', { module_id: ctrl.moduleIdRouteId });
            }
        }

        //Listview Search (Check listview pages)
        this.listviewSearchStat = false;

        this.lvSearch = function () {
            this.listviewSearchStat = true;
        }

        //Listview menu toggle in small screens
        this.lvMenuStat = false;

        //Blog
        this.wallCommenting = [];

        this.wallImage = false;
        this.wallVideo = false;
        this.wallLink = false;

        this.skinList = [
            'lightblue',
            'bluegray',
            'cyan',
            'teal',
            'green',
            'orange',
            'blue',
            'purple'
        ]

        this.skinSwitch = function (color) {
            $rootScope.currentSkin = color;
            //Set product logo based on current theme color
            $rootScope.product_logo = ctrl.isDarkThemeColor($rootScope.currentSkin) ? $rootScope.product_logo_darktheme : $rootScope.product_logo_lighttheme;
            localStorage.themeColour = color;
        }

        // $rootScope.product_logo = $rootScope.product_logo_lighttheme;
        //check if applied theme is of dark color
        this.isDarkThemeColor = function (themeColor) {
            themeColor = themeColor == 'default' ? 'lightblue' : themeColor;
            var isDarkTheme = false;
            isDarkTheme = ($rootScope.darkThemeColors.indexOf(themeColor) > -1);
            if (!isDarkTheme) {

                var themeColorIndex;
                for (var i = 0; i < $rootScope.darkThemeColors.length; ++i) {
                    if (themeColor.toLowerCase() === $rootScope.darkThemeColors[i].toLowerCase()) {
                        themeColorIndex = i;
                        break;
                    }
                }
                // Commented as findIndex method is not supported in IE
                //var themeColorIndex = $rootScope.darkThemeColors.findIndex(function (color) {
                //    return themeColor.toLowerCase() === color.toLowerCase();
                //});
                isDarkTheme = themeColorIndex > -1;
            }
            return isDarkTheme;
        }

        this.doLogout = function () {
            if (ctrl.moduleIdRouteId) {
                ctrl.moduleIdRouteId = 'DEFAULT';
                ctrl.module = {};
            }
            $rootScope.product_logo = $rootScope.product_logo_lighttheme;
            authService.logout();
            if (appSettings.authAuthMode === 'SAML_AZURE') {
                adalService.logOut();
                adalService.clearCache();
            }
            //if (stateMgmtService.getPageParams().length > 0) {
            stateMgmtService.removePageParams();
            // }
            $state.go('logout');
            //Stop Idle watch after logout
            Idle.unwatch();
        }

        this.showProfile = function () {
            $state.go('userProfile.user-profile');//, { id: authService.authentication.id });
        }

        //Auth Service
        //$scope.authentication = authService.authentication;


        //Allow roles
        this.allowRole = function (roles) {
            var listRoles = roles.split(",");
            var currentRoles = authService.authentication.roles.split(",");

            return listRoles.some(function (role) {
                return currentRoles.includes(role);
            });
        }


        // IDLE TIMEOUT EVENTS
        $scope.events = [];
        $scope.$on('IdleStart', function () {

            // the user appears to have gone idle
            swal({
                title: "Inactive session detected",
                text: "Your session will logout in " + toWarn + " seconds",
                type: "warning",
                showCancelButton: false,
                confirmButtonColor: "#F44336",
                confirmButtonText: "Resume session",
                timer: toWarn * 1000,
                closeOnConfirm: true
            }, function () {

                window.onkeydown = null;
                window.onfocus = null;
                //console.log("Resume Session") ;
                if (confirm) {
                    authService.resumeSession();
                }
            });
        });

        $scope.$on('IdleWarn', function (e, countdown) {
            // follows after the IdleStart event, but includes a countdown until the user is considered timed out
            // the countdown arg is the number of seconds remaining until then.
            // you can change the title or display a warning dialog from here.
            // you can let them resume their session by calling Idle.watch()
            //console.log("Idle Warn", countdown);


        });

        $scope.$on('IdleTimeout', function () {
            // the user has timed out (meaning idleDuration + timeout has passed without any activity)
            // this is where you'd log them
            //console.log("Idle Timeout", new Date().getTime());


            ctrl.doLogout();
            swal.close();
            $modalStack.dismissAll("Session out");
        });

        $scope.$on('IdleEnd', function () {
            // the user has come back from AFK and is doing stuff. if you are warning them, you can use this to hide the dialog
            // console.log("Idle End Event", new Date().getTime());

            //authService.resumeSession();

        });

        $scope.$on('Keepalive', function () {
            // do something to keep the user's session alive
            //console.log("Idle KeepAlive", new Date().getTime());

            var moduleId = $rootScope.getModuleId($stateParams.module_id);
            authService.resumeSession(moduleId);
        });

        //Module
        ctrl.module = {};

        ctrl.moduleIdRouteId = 'DEFAULT';
        ctrl.isModuleSelected = $rootScope.isModuleSelected(ctrl.moduleIdRouteId);
        $scope.$on('MODULE_ID_CHANGED', function (e, module) {
            ctrl.module = module;

            //Require module name for dynamic workflow.
            $rootScope.moduleName = ctrl.module.moduleName;
            
            ctrl.moduleIdRouteId = ctrl.module.moduleId ? ctrl.module.moduleId : 'DEFAULT';
            ctrl.isModuleSelected = $rootScope.isModuleSelected(ctrl.moduleIdRouteId);

            ctrl.buildNavigationMenu($rootScope.getModuleId(ctrl.moduleIdRouteId));
        });

        $scope.$on('MODULE_ID_INVALID_ACCESS', function (e) {           
            ctrl.module = {};
            $rootScope.moduleName = undefined;
            ctrl.moduleIdRouteId = 'DEFAULT';
            ctrl.isModuleSelected = $rootScope.isModuleSelected(ctrl.moduleIdRouteId);
            fillAuthRolesForModule();           
            $state.go('home.index');
        });

        this.selectModule = function (state) {
          
            if (state == 'home') {
                ctrl.module = {};
                $rootScope.moduleName = undefined;
                ctrl.moduleIdRouteId = 'DEFAULT';
                ctrl.isModuleSelected = $rootScope.isModuleSelected(ctrl.moduleIdRouteId);
                fillAuthRolesForModule();
                stateMgmtService.persitantData = [];
                $state.go('home.index');
            } else {
                $state.go('module.home', { module_id: ctrl.module.moduleId, defType: 'home'});
            }
        }

        var fillAuthRolesForModule = function () {

            var moduleId = $rootScope.getModuleId(ctrl.moduleIdRouteId);
            authService.getUserRolesForModule(moduleId).then(function (response) {
                if (response && response.data) {

                    var roleData = response.data;
                    authService.fillAuthDataForSelectedmodule(roleData.userRoles, roleData.userRoleActions);
                    ctrl.buildNavigationMenu();
                }
            }).catch(function (err) {
                $scope.global.apiError(err, "SWAL");
            });
        }


        //Invokes while Broadcasting RefreshMetrics.
        $scope.$on("REFRESH-MENU", function (evt, moduleId) {

            ctrl.buildNavigationMenu();
        })

        this.buildNavigationMenu = function () {

            var moduleId = $rootScope.getModuleId(ctrl.moduleIdRouteId);           
            ctrl.isModuleSelected = $rootScope.isModuleSelected(moduleId);

            this.navigationItems = [];
            this.caseManagementDashNavigations = [];           

            authService.getDynamicMenu(moduleId).then(function (data) {
                if (data != null) {

                    var navigations = data.map(function (a) {
                            if (a.jsonData != null && a.jsonData != '') {
                                var convertToJson = angular.fromJson(a.jsonData);
                                return convertToJson.features;
                            }
                    });
                    navigations.reverse();
                    ctrl.dynamicNavigationItems = navigations;

                    ctrl.hasDDP = false;
                    ctrl.hasCAL = false;
                    ctrl.hasDYN = false;
                    ctrl.hasDSH = false;
                    ctrl.hasWRF = false;
                    ctrl.hasRPT = false;
                    ctrl.hasRPTMGMT = false;

                    angular.forEach(ctrl.dynamicNavigationItems[0], function (value, index) {

                        if (value.friendlyID === 'DDP' && value.isActive) {
                            ctrl.hasDDP = true;
                        }
                        else if (value.friendlyID === 'CAL' && value.isActive) {
                            ctrl.hasCAL = true;
                        }
                        else if (value.friendlyID === 'DYN' && value.isActive) {
                            ctrl.hasDYN = true;
                        }
                        else if (value.friendlyID === 'DSH' && value.isActive) {
                            ctrl.hasDSH = true;
                        }
                        else if (value.friendlyID === 'WRF' && value.isActive) {
                            ctrl.hasWRF = true;
                        }
                        else if (value.friendlyID === 'RPT' && value.isActive) {
                            ctrl.hasRPT = true;
                        }
                        else if (value.friendlyID === 'RPTMGMT' && value.isActive) {
                            ctrl.hasRPTMGMT = true;
                        }
                    });
                    
                }
            }).catch(function (err) {
                $scope.global.apiError(err, "SWAL");
            });

            authService.getDashboardMenu(moduleId).then(function (data) {
                var navItems = [];
                if (data != null && data.length > 0) {
                    for (var i = 0; i < data.length; i++) {
                        var navigationGroup = angular.fromJson(data[i].jsonData);
                        for (var j = 0; j < navigationGroup.navigations.length; j++) {
                            navItems.push(navigationGroup.navigations[j]);
                        }

                    }
                    ctrl.navigationItems = navItems;
                }
            }).catch(function (err) {
                $scope.global.apiError(err, "SWAL");
            });



            authService.getTabMenu('NAVIGATION-OR-DEF').then(function (data) {
                if (angular.isObject(data)) {
                    var convertToJson = angular.fromJson(data.jsonData);
                    ctrl.operationalNavigations = convertToJson.navigations;
                }
            }).catch(function (err) {
                $scope.global.apiError(err, "SWAL");
            });



        };

        this.skinSwitch($rootScope.currentSkin);
    }

    //PING CONTROLLER
    app.controller('pingCtrl', pingCtrl);
    pingCtrl.$inject = ['$http', 'appSettings'];

    function pingCtrl($http, appSettings) {

        $http.get(appSettings.apiBaseUri + 'api/Account/Ping');
    };

    //Azure AD Controller
    app.controller('userDataCtrl', userDataCtrl);
    userDataCtrl.$inject = ['$scope', 'adalAuthenticationService'];

    function userDataCtrl($scope, adalService) {

        $scope.claims = [];

        this.login = function () {
            adalService.login();
        };
        this.logout = function () {
            if (ctrl.moduleIdRouteId) {
                ctrl.moduleIdRouteId = 'DEFAULT';
                ctrl.module = {};
            }
            adalService.logOut();
        };

        for (var property in adalService.userInfo.profile) {
            if (adalService.userInfo.profile.hasOwnProperty(property)) {
                $scope.claims.push({
                    key: property,
                    value: adalService.userInfo.profile[property],
                });
            }
        }
    };


    // LOGIN CONTROLLER
    app.controller('loginCtrl', loginCtrl);
    loginCtrl.$inject = ['$scope', '$rootScope', '$state', '$document', 'authService', 'Idle', 'appSettings', 'adalAuthenticationService', 'globalService', 'masterdatamgmtSetupService','stateMgmtService'];

    function loginCtrl($scope, $rootScope, $state, $document, authService, Idle, appSettings, adalService, globalService, masterdatamgmtSetupService,stateMgmtService) {

        $document[0].title = brand_app_name;

        this.loginData = {
            userName: "",
            password: "",
            TFA: ""
        };

        this.init = function (externalLogin) {
            this.showExternalLanding = 0;
            this.showLogin = 1;
            this.showRegister = 0;
            this.showExternalLogin = externalLogin;
            this.showExternalRegister = 0;
            this.userStatus = "";
            this.redirectPending = false;
            this.registerSuccess = false;
            this.moduleId = undefined;
            this.defType = undefined;
            if (appSettings.authAuthMode == "REPO") {
                this.registerData = {
                    firstName: "",
                    lastName: "",
                    userName: "",
                    password: "",
                    confirmPassword: "",
                    businessPhone: null,
                    timeZone: null,
                    country: null,
                    dateFormat: null,
                    primaryLanguage: null,
                    secondaryLanguage: null,
                    supportemail: null
                }
            }
            else if (appSettings.authAuthMode == "AD") {
                this.registerData = {
                    firstName: "",
                    lastName: "",
                    userName: "",
                    password: "",
                    userEmail: "",
                    businessPhone: null,
                    timeZone: null,
                    country: null,
                    dateFormat: null,
                    primaryLanguage: null,
                    secondaryLanguage: null,
                    supportemail: null
                }
            }
            else if (appSettings.authAuthMode == "SAML_AZURE") {
                this.registerData = {
                    firstName: "",
                    lastName: "",
                    userName: "",
                    password: "",
                    Email: "",
                    accessReason: "",
                    businessPhone: null,
                    timeZone: null,
                    country: null,
                    dateFormat: null,
                    primaryLanguage: null,
                    secondaryLanguage: null,
                    supportemail: null
                };

                var token = adalService.getCachedToken(appSettings.clientId);

                if (appSettings.authAuthMode === "SAML_AZURE" && !location.hash.toLowerCase().contains('token') && loginType === 'EXTERNAL' && this.showExternalLogin == 0 && token == null) {
                    this.showExternalLanding = 1;

                } else {
                    this.showLogin = 0;
                   
                    if (!adalService.userInfo.isAuthenticated && token === null) {
                        adalService.login();
                        //authService.readActionTags();
                    }
                    else if (!authService.authentication.isAuth) {
                        var token;
                        adalService.acquireToken(appSettings.clientId).then(function (response) {
                            token = response;
                        }, function (err) {
                            adalService.login();
                        });

                        if (token === undefined) {
                            token = adalService.getCachedToken(appSettings.clientId);
                        }
                        authService.AzureADLogin(adalService.userInfo.profile.upn, token).then(function (response) {
                            // start watching when the app runs. also starts the Keepalive service by default.
                            Idle.watch();
                           
                            //Redirect to the url from where user has requested the application
                            ctrl.getRedirectModule();
                            if (ctrl.moduleId != undefined) {
                                clientDirectAccessUrl = undefined;
                                $state.go('module.home', { module_id: ctrl.moduleId, defType: ctrl.defType });
                            }
                            else {
                                authService.redirectToAttemptedUrl(localStorage.getItem("originalUrl"));
                            }
                            authService.readActionTags();
                        },
                            function (err) {
                                if (err && err.data) {
                                    ctrl.showLogin = 0;
                                    ctrl.showRegister = 1;
                                    ctrl.userValidated = 1;

                                    if (err.data.error === "invalid_grant") {
                                        ctrl.registerData.firstName = adalService.userInfo.profile.given_name;
                                        ctrl.registerData.lastName = adalService.userInfo.profile.family_name;
                                        //ctrl.registerData.Email   = adalService.userInfo.profile.unique_name;
                                        ctrl.registerData.userName = adalService.userInfo.userName;
                                        ctrl.registerData.userEmail = adalService.userInfo.profile.upn;

                                        ctrl.redirectPending = false;
                                        $state.go('login');
                                        // authService.redirectToAttemptedUrl(localStorage.getItem("originalUrl"));
                                        //autoRegister(appSettings.authAuthMode, ctrl.registerData, adalService, token);
                                    }
                                    else {
                                        //$scope.global.apiError(err, true);
                                        ctrl.registerData.userName = adalService.userInfo.userName;
                                        ctrl.redirectPending = true;
                                        ctrl.redirectPendingMessage = err.data.message || err.data.error_description;
                                    }
                                    ctrl.showLogin = 0;
                                } else {
                                    ctrl.unapprovedUser = true;
                                }

                            });
                    }
                    else if (to.redirectTo) {

                        evt.preventDefault();
                        //Redirect
                        $state.go(to.redirectTo, params)
                    }
                    else if (authService.authentication.isAuth && to.name.endsWith('login') === 0) {

                        evt.preventDefault();
                        //redirect to HOME
                        $state.go('home.index');
                    }
                }


            }
        };

        //Auto REGISTER
        this.autoRegister = function (authMode, registerData, adalService, token) {

            authService.saveRegistration(authMode, registerData).then(function (response) {
                //ctrl.registerSuccess = true;

                //$scope.qrCode = response.data.psk;
                //$scope.needApproval = response.data.needApproval;
                //$scope.needTFA = response.data.needTFA;
                //$scope.qrCodeSrc = "https://chart.googleapis.com/chart?chs=260x260&chld=M|0&cht=qr&chl=otpauth://totp/" + registerData.userName + appMarker + "%3Fsecret%3D" + $scope.qrCode;

                authService.AzureADLogin(adalService.userInfo.profile.upn, token).then(function (response) {


                    // start watching when the app runs. also starts the Keepalive service by default.
                    Idle.watch();

                    //Redirect to the url from where user has requested the application
                    authService.redirectToAttemptedUrl(localStorage.getItem("originalUrl"));
                },
                    function (err) {

                        if (err && err.data) {

                        }

                    });


            },
                function (err) {
                    $window.location.reload();

                });
        }

        this.getRedirectModule = function () {
            // below code is to redirect to user specific module and defType when send URL as a notification.
            if (clientDirectAccessUrl != undefined && clientDirectAccessUrl != null && clientDirectAccessUrl!="" && clientDirectAccessUrl.indexOf('?') !== -1 ) {
                var urlData = clientDirectAccessUrl.split('?')[1].split('&amp;');
                ctrl.moduleId = urlData[0].split('=')[1];
                var moduleName = urlData[1].split('=')[1];
                ctrl.defType = urlData[2].split('=')[1];
                for (var i = 3; i < urlData.length; i++) {
                    stateMgmtService.dynamicSharedVariable[urlData[i].split('=')[0]] = urlData[i].split('=')[1].replace(/[+]/g, ' ');
                }
                var module = {
                    moduleId: ctrl.moduleId,
                    moduleName: moduleName.replace(/[+]/g, ' ')
                }
                localStorage.setItem('ModuleId', ctrl.moduleId);
                $rootScope.$broadcast("MODULE_ID_CHANGED", module);
                $rootScope.$broadcast("SET_MODULE", module);
            }
        }
        var ctrl = this;

        this.init(0);

        this.pwResetData = {
            userName: ""
        };

        this.userValidated = false;
        this.showForgot = 0;

        this.registerSuccess = false;
        this.pwResetSuccess = false;

        //appMarker used for Google Authenticator for now
        var appMarker = " (" + appSettings.appDID + ")";
        
        //Getting the list of all active primary languages
        masterdatamgmtSetupService.getAllActivePrimaryLanguages().then(function (responseData) {
            ctrl.primarylanguages = responseData;
        }).catch(function (err) {
            $scope.global.apiError(err, "SWAL");
        });

        //Getting the list of all active secondary languages
        masterdatamgmtSetupService.getAllActiveSecondaryLanguages().then(function (dataFromResponse) {
            ctrl.secondarylanguages = dataFromResponse;
        }).catch(function (err) {
            $scope.global.apiError(err, "SWAL");
        });

        //GET LIST OF ALL COUNTRIES 
        globalService.getCountries().then(function (response) {
            ctrl.countries = response;
        },
            function (err) {
                $scope.global.apiError(err, true);
            });

        // To get the genral conig data
        authService.getGeneralConfigData().then(function (result) {

            if (result !== null) {
                ctrl.supportemail = result["supportEmail"];
                ctrl.supportEmailText = result["supportEmailText"];
                ctrl.dateformats = result["dateformats"];
                ctrl.timezones = result["timezones"];
            }
        });


        //LOGIN
        this.doLogin = function () {

            authService.login(ctrl.loginData).then(function (response) {
                // start watching when the app runs. also starts the Keepalive service by default.
                Idle.watch();
                // below code is to redirect to user specific module and defType when send URL as a notification.
                ctrl.getRedirectModule();
                if (ctrl.moduleId != undefined) {
                    clientDirectAccessUrl = undefined;
                    $state.go('module.home', { module_id: ctrl.moduleId, defType: ctrl.defType });
                }
                else {
                    $state.go('home.index');
                }
                //$state.go('module.index');
                // authService.redirectToAttemptedUrl();
                authService.readActionTags();
            },
                function (err) {
                    $scope.global.apiError(err, true);

                    if (appSettings.authAuthMode !== "SAML_AZURE") {
                        $state.go('login');
                    }
                });
        }


        //INITIAL REGISTER
        this.doRegister = function () {
            ctrl.registerData.supportemail = ctrl.supportemail;
            var token = adalService.getCachedToken(appSettings.clientId);
            if (appSettings.authAuthMode === "SAML_AZURE" && !token && loginType === 'EXTERNAL') {
                this.registerData.email = this.registerData.userEmail;
                authService.saveExternalUser(this.registerData).then(function (data) {
                    ctrl.userStatus = data.data;
                }).catch(function (err) {
                    $scope.global.apiError(err, "SWAL");
                    ctrl.registerSuccess = false;
                });
            } else {
                authService.saveRegistration(appSettings.authAuthMode, ctrl.registerData).then(function (response) {
                    ctrl.registerSuccess = true;

                    $scope.qrCode = response.data.psk;
                    $scope.needApproval = response.data.needApproval;
                    $scope.needTFA = response.data.needTFA;
                    $scope.qrCodeSrc = "https://chart.googleapis.com/chart?chs=260x260&chld=M|0&cht=qr&chl=otpauth://totp/" + ctrl.registerData.userName + appMarker + "%3Fsecret%3D" + $scope.qrCode;

                    ctrl.registerData = {};
                },
                    function (err) {
                        $scope.global.apiError(err, true);
                        ctrl.registerSuccess = false;
                    });
            }


        };


        //Request a password reset
        this.doPasswordReset = function () {

            authService.requestPasswordReset(ctrl.pwResetData).then(function (response) {
                ctrl.pwResetSuccess = true;
                ctrl.pwResetData = {};
            },
                function (err) {
                    $scope.global.apiError(err, true);
                    ctrl.pwResetSuccess = false;
                });
        };


        this.doValidateADUser = function () {
            var userData = {
                userName: ctrl.registerData.userName,
                password: ctrl.registerData.password
            };
            authService.validateADUser(userData).then(function (response) {
                ctrl.userValidated = true;

                ctrl.registerData.firstName = response.data.firstName;
                ctrl.registerData.lastName = response.data.lastName;
                ctrl.registerData.userEmail = response.data.userEmail;
            },
                function (err) {
                    $scope.global.apiError(err, true);
                    ctrl.userValidated = false;
                });
        }

        //Force Logout if not auth
        if (authService.authentication.isAuth) {
            if (ctrl.moduleIdRouteId) {
                ctrl.moduleIdRouteId = 'DEFAULT';
                ctrl.module = {};
            }
            authService.logout();
        };

        //SHOW EXTERNAL LOGIN PAGE
        this.showExternalLoginForm = function () {
            this.init(1);
        };
    };



    // LOGIN EXTENDED CONTROLLER
    app.controller('loginExCtrl', loginExCtrl);
    loginExCtrl.$inject = ['$scope', '$state', '$stateParams', 'authService', 'appSettings']

    function loginExCtrl($scope, $state, $stateParams, authService, appSettings) {

        this.opSuccess = false;
        this.opMessage = "";
        this.pwResetData = {
            password: "",
            confirmPassword: ""
        }

        //appMarker used for Google Authenticator for now
        var appMarker = " (" + appSettings.appDID + ")";

        var ctrl = this;

        this.loginConfirmEmail = function () {
            //Validate parameters
            if (!$stateParams.id || !$stateParams.token) {
                if (appSettings.authAuthMode !== "SAML_AZURE") {
                    $state.go('login')
                }
            }

            else {
                authService.confirmEmail($stateParams.id, $stateParams.token).then(function (response) {
                    $scope.userName = response.data.userName;
                    $scope.qrCode = response.data.psk;
                    $scope.needTFA = response.data.needTFA;
                    $scope.qrCodeSrc = "https://chart.googleapis.com/chart?chs=260x260&chld=M|0&cht=qr&chl=otpauth://totp/" + $scope.userName + ctrl.appMarker + "%3Fsecret%3D" + $scope.qrCode;

                    ctrl.opSuccess = JSON.parse(response.data.needTFA);
                    // if TFA is turn off it will directly go to login page
                    if (!ctrl.opSuccess) {
                        $state.go('login')
                    }

                }, function (err) {
                    ctrl.opSuccess = false;
                    ctrl.opMessage = $scope.global.apiError(err);
                });
            }
        };

        this.doConfirmPasswordReset = function () {

            //Validate parameters
            if (!$stateParams.id || !$stateParams.token) {
                if (appSettings.authAuthMode !== "SAML_AZURE") {
                    $state.go('login')
                }
            }
            else {
                authService.confirmPasswordReset($stateParams.id, $stateParams.token, ctrl.pwResetData.password, ctrl.pwResetData.confirmPassword)
                    .then(function (response) {
                        $scope.userName = response.data.userName;
                        $scope.qrCode = response.data.psk;
                        $scope.needTFA = response.data.needTFA;
                        $scope.qrCodeSrc = "https://chart.googleapis.com/chart?chs=260x260&chld=M|0&cht=qr&chl=otpauth://totp/" + $scope.userName + ctrl.appMarker + "%3Fsecret%3D" + $scope.qrCode;

                        ctrl.opSuccess = JSON.parse(response.data.needTFA);
                        // if TFA is turn off it will directly go to login page
                        if (!ctrl.opSuccess) {
                            $state.go('login')
                        }

                    }, function (err) {
                        ctrl.opSuccess = false;
                        ctrl.opMessage = $scope.global.apiError(err);
                    });
            }
        }

        //ON LOAD
        switch ($state.current.name) {
            case "login-confirm-email":
                ctrl.loginConfirmEmail();
                break;
            case "login-confirm-password-reset":
                ctrl.password = "";
                ctrl.confirmPassword = "";
                break;
            default:
                if (appSettings.authAuthMode !== "SAML_AZURE") {
                    $state.go('login')
                }
        };

    }


    // EXTERNAL USER CONTROLLER
    app.controller('externalUserCtrl', externalUserCtrl);
    externalUserCtrl.$inject = ['$scope', '$state', 'authService', 'Idle', 'appSettings', 'adalAuthenticationService', 'globalService', 'masterdatamgmtSetupService'];

    function externalUserCtrl($scope, $state, authService, Idle, appSettings, adalService, globalService, masterdatamgmtSetupService) {

        var ctrl = this;
        ctrl.registerSuccess = false;
        ctrl.userStatus = "";
        ctrl.supportemail = "";
        ctrl.supportemailText = "";
        this.registerData = {
            firstName: null,
            lastName: null,
            email: null,
            businessPhone: null,
            timeZone: null,
            country: null,
            dateFormat: null,
            primaryLanguage: null,
            secondaryLanguage: null,
            supportemail: null
        };

        //Getting the list of all active primary languages
        masterdatamgmtSetupService.getAllActivePrimaryLanguages().then(function (responseData) {
            ctrl.primarylanguages = responseData;
        }).catch(function (err) {
            $scope.global.apiError(err, "SWAL");
        });

        //Getting the list of all active secondary languages
        masterdatamgmtSetupService.getAllActiveSecondaryLanguages().then(function (dataFromResponse) {
            ctrl.secondarylanguages = dataFromResponse;
        }).catch(function (err) {
            $scope.global.apiError(err, "SWAL");
        });

        //GET LIST OF ALL COUNTRIES 
        globalService.getCountries().then(function (response) {
            ctrl.countries = response;
        },
            function (err) {
                $scope.global.apiError(err, true);
            });

        authService.getGeneralConfigData().then(function (result) {

            if (result !== null) {
                ctrl.supportemail = result["supportEmail"];
                ctrl.supportEmailText = result["supportEmailText"];
                ctrl.dateformats = result["dateformats"];
                ctrl.timezones = result["timezones"];
            }
        });

        //GET LIST OF ALL LANGUAGES, DATE FORMATS, TIME ZONES
        //globalService.getMasterconfiguration().then(function (data) {
        //    if (angular.isObject(data)) {
        //        ctrl.supportemail = angular.fromJson(data.jsonData).supportEmail;
        //        ctrl.dateformats = angular.fromJson(data.jsonData).dateformats;
        //        ctrl.timezones = angular.fromJson(data.jsonData).timezones;
        //    }
        //}).catch(function (err) {
        //    $scope.global.apiError(err, "SWAL");
        //});


        //SAVE USER DETAILS AND SEND EMAIL TO DEV OPS
        this.registerUser = function () {
            ctrl.registerData.supportemail = ctrl.supportemail;
            authService.saveExternalUser(this.registerData).then(function (data) {
                ctrl.userStatus = data.data;
            }).catch(function (err) {
                $scope.global.apiError(err, "SWAL");
                ctrl.registerSuccess = false;
            });
        };

        //SHOW EXTERNAL REGISTRATION PAGE
        this.ShowExternalRegistration = function () {
            $state.go("external-landing-register");
        };

        //SHOW EXTERNAL LOGIN PAGE
        this.ShowExternalLogin = function () {
            $state.go("login");
        };

        //SHOW EXTERNAL LANDING PAGE
        this.ShowExternalLanding = function () {
            $state.go("external-landing");
        };
    }


    // HEADER CONTROLLER
    app.controller('headerCtrl', headerCtrl);
    headerCtrl.$inject = ['$timeout', '$location', '$window', 'messageService', 'notificationService', 'notificationHubService', '$state', '$scope', 'authService', 'stateMgmtService', '$rootScope', '$interval', 'localStorageService'];

    function headerCtrl($timeout, $location, $window, messageService, notificationService, notificationHubService, $state, $scope, authService, stateMgmtService, $rootScope, $interval, localStorageService) {

        var ctrl = this;
        var xintval;

        // Top Search
        this.openSearch = function () {
            angular.element('#header').addClass('search-toggled');
            angular.element('#top-search-wrap').find('input').focus();
        }

        this.closeSearch = function () {
            angular.element('#header').removeClass('search-toggled');
        }

        this.notifications = [];
        this.notificationsType = 0; // All
        this.notificationsPageSize = 10;
        this.notificationsCount = 0;
        this.notificationsCountUnread = 0;

        this.notificationsAvailable = true;

        this.init = function () {
            ctrl.deleteNotificationsOutdated();
        }

        // Get list of recent notifications
        this.deleteNotificationsOutdated = function () {
            notificationService.deletetNotificationsOutDated().then(function (result) {
                ctrl.loadNotifications();
            }).catch(function (err) {
                $scope.global.apiError(err, "SWAL");
            });
        }

        //ACTION: Refresh auth token 
        this.refreshToken = function () {
            authService.refreshToken();
        }

        //ACTION: View Notification List
        //PARAMETER: type = 0 for all notifications
        this.viewNotificationList = function () {
            $location.path('/notifications/0');
        }

        // Get list of recent notifications
        this.loadNotifications = function () {
            notificationService.getNotifications(0, ctrl.notificationsPageSize, ctrl.notificationsType).then(function (result) {
                //Initialize notifications List
                ctrl.notifications = result.listOfItens;
                ctrl.notificationsCount = result.count;
                ctrl.notificationsCountUnread = result.countUnread;
            }).catch(function (err) {
                $scope.global.apiError(err, "SWAL");
            });
        }

        // Load More Notifications Action
        this.loadMoreNotifications = function () {
            notificationService.getNotifications(ctrl.notifications.length, ctrl.notificationsPageSize, ctrl.notificationsType).then(function (result) {
                // load more notificaiton
                ctrl.notifications.push.apply(ctrl.notifications, result.listOfItens);
                ctrl.notificationsCount = result.count;
                ctrl.notificationsCountUnread = result.countUnread;
           }).catch(function (err) {
                $scope.global.apiError(err, "SWAL");
            });
        }

        $rootScope.$on("CallLoadMoreNotifications", function () {
            ctrl.loadNotifications();
        });
        // Got to notification url and set it to read if it is unread
        this.goToNotificationUrl = function (notification) {
            var url = notification.url;
            if (notification.status == 0) {
                notificationService.setNotificationAsRead(notification.id, true).then(function (result) {
                    // do nothing yet
                }).catch(function (err) {
                    $scope.global.apiError(err, "SWAL");
                });
            }
            stateMgmtService.setState(false);
            var currentUrl = $location.url();
            localStorage.setItem("prevURl", currentUrl);
            $location.path(url);
        }

        // Notification Hub Service Method for Inactive user at solution level and Module level
        notificationHubService.updateRoleStatus = function (userIds, moduleId, userName) {
            if (authService.authentication.userName != userName) {
                var userId = authService.authentication.id;
                if (moduleId === "") {
                    if (userIds.indexOf(userId) !== -1) {
                        swal({
                            title: "Alert!",
                            text: "Role associated with this User has been marked as Inactive.",
                            type: "warning"
                        }, function () {
                            //Redirect to Login screen after clearing session
                            authService.logout();
                            $state.go('logout');
                        });
                    }
                }
                else {
                    if (userIds.indexOf(userId) !== -1) {
                        var loginModuleId = localStorageService.get('ModuleId');
                        loginModuleId = $rootScope.getModuleId(loginModuleId);

                        if (moduleId == loginModuleId) {
                            swal({
                                title: "Alert!",
                                text: "Role associated with this User has been marked as Inactive.",
                                type: "warning"
                            }, function () {
                                //Redirect to Solution home screen from module
                                $rootScope.$broadcast("MODULE_ID_INVALID_ACCESS");
                            });
                        }
                    }
                }
            }
        }

        // Notification Hub Service Method to Update notifications on widget
        notificationHubService.updateNotificationsOnWidget = function () {
            ctrl.notifications = [];
            notificationService.getNotifications(0, ctrl.notifications.length + ctrl.notificationsPageSize, ctrl.notificationsType).then(function (result) {
                //update notifications List
                ctrl.notifications = result.listOfItens;
                ctrl.notificationsCount = result.count;
                ctrl.notificationsCountUnread = result.countUnread;
            }).catch(function (err) {
                $scope.global.apiError(err, "SWAL");
            });
        }


        // Get messages and notification for header
        this.img = messageService.img;
        this.user = messageService.user;
        this.text = messageService.text;

        this.messageResult = messageService.getMessage(this.img, this.user, this.text);

        this.getClassNotficationsDropdown = function (event) {
            //Specific to determine the class "dropup" ow "dropup" according to dashboard box space
            if (this.notifications.length >= 4 && event.$index >= (this.notifications.length - 2)) {
                return 'dropup';
            } else {
                return 'dropdown';
            }
        };

        //function that changes the notification status to read
        this.setAllNotificationAsRead = function ($event) {
            notificationService.setAllNotificationAsRead().then(function (response) {
                // do nothing yet
            }).catch(function (err) {
                $scope.global.apiError(err, "SWAL");
            });
        }

        this.deleteAllNotificationItems = function ($event) {
            swal({
                title: "Are you sure?",
                text: "You are deleting all notification items",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#F44336",
                confirmButtonText: "Yes, delete all!",
                closeOnConfirm: true
            }, function () {
                notificationService.DeleteAllNotificationItems().then(function (response) {
                    // do nothing yet
                }).catch(function (err) {
                    $scope.global.apiError(err, "SWAL");
                });
            });
        }

        //function that changes the notification status to read
        this.setNotificationAsRead = function (notification) {
            notificationService.setNotificationAsRead(notification.id, false).then(function (response) {
                // do nothing yet
            }).catch(function (err) {
                $scope.global.apiError(err, "SWAL");
            });
        }

        //function that changes the notification status to unread
        this.setNotificationAsUnread = function (notification) {
            notificationService.setNotificationAsUnread(notification.id, false).then(function (response) {
                // do nothing yet
            }).catch(function (err) {
                $scope.global.apiError(err, "SWAL");
            });
        }

        this.deleteNotificationItem = function (id, title) {
            swal({
                title: "Are you sure?",
                text: "You are deleting notification item (" + title + ")",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#F44336",
                confirmButtonText: "Yes, delete!",
                closeOnConfirm: true
            }, function () {
                notificationService.deleteNotificationItem(id).then(function (response) {
                    // do nothing yet
                }).catch(function (err) {
                    $scope.global.apiError(err, "SWAL");
                });
            });
        }

        //Clear Notification
        this.clearNotification = function ($event) {
            $event.preventDefault();

            var x = angular.element($event.target).closest('.listview');
            var y = x.find('.lv-item');
            var z = y.size();

            angular.element($event.target).parent().fadeOut();

            x.find('.list-group').prepend('<i class="grid-loading hide-it"></i>');
            x.find('.grid-loading').fadeIn(1500);
            var w = 0;

            y.each(function () {
                var z = $(this);
                $timeout(function () {
                    z.addClass('animated fadeOutRightBig').delay(1000).queue(function () {
                        z.remove();
                    });
                }, w += 150);
            })

            $timeout(function () {
                angular.element('#notifications').addClass('empty');
            }, (z * 150) + 200);
        }

        //Fullscreen View
        this.fullScreen = function () {
            // Test for each of the supported versions of full screen APIs and call 
            // either requestFullscreen or cancelFullScreen (or exitFullScreen)
            //  Structure: 
            //  Does the incoming target support requestFullscreen (or prefaced version)
            //  if (there is a fullscreen element) 
            //      then cancel or exit
            //  else request full screen mode

            var divObj = document.documentElement;  //  get the target element

            if (divObj.requestFullscreen)
                if (document.fullScreenElement) {
                    document.cancelFullScreen();
                } else {
                    divObj.requestFullscreen();
                }
            else if (divObj.msRequestFullscreen)
                if (document.msFullscreenElement) {
                    document.msExitFullscreen();
                } else {
                    document.body.msRequestFullscreen();
                }
            else if (divObj.mozRequestFullScreen)
                if (document.mozFullScreenElement) {
                    document.mozCancelFullScreen();
                } else {
                    divObj.mozRequestFullScreen();
                }
            else if (divObj.webkitRequestFullscreen)
                if (document.webkitFullscreenElement) {
                    document.webkitCancelFullScreen();
                } else {
                    divObj.webkitRequestFullscreen();
                }
        }



        this.init();
        //Load Notification in specific interval 
        xintval = $interval(function () {
            if (localStorage.getItem('ngIdle.expiry') == null || localStorage.getItem('ngIdle.expiry') == '' || $rootScope.isSesssionExpire == true) {
                ctrl.myStopFunction();
            }
            else {
                var expireDate = new Date(JSON.parse(localStorage.getItem('ngIdle.expiry')).time);
                var currrentDate = new Date();

                if (expireDate < currrentDate) {
                    ctrl.myStopFunction();
                }
                else {
                    $rootScope.$emit("CallLoadMoreNotifications", {});
                }
            }
        }, 1000000);

        ctrl.myStopFunction = function () {
            $interval.cancel(xintval)
        }
    };


})(angular.module('common.modules'));
