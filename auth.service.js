(function (app) {
    'use strict';
    app.value('redirectToUrlAfterLogin', { url: '#/home' });
    app.factory('authService', authService);
    authService.$inject = ['$http', '$q', '$rootScope', 'localStorageService', 'appSettings', 'notificationHubService', 'redirectToUrlAfterLogin', '$window'];

    function authService($http, $q, $rootScope, localStorageService, appSettings, notificationHubService, redirectToUrlAfterLogin, $window) {

        var service = this;
        var actionTag;
        service.authentication = {};
        var _authentication = { isAuth: false };
        var systemActionTags;
        var userInfo;
        var tokenInfo;

        //SAVE EXTERNAL USER
        service.saveExternalUser = function (registration) {
            return $http.post(appSettings.apiBaseUri + 'api/ExternalUsers/CreateUser', registration).then(function (response) {
                return response;
            });
        }

        //SAVE REGISTRATION
        this.saveRegistration = function (authMode, registration) {
            registration.domain = loginType;
            registration.PhoneNumber = registration.businessPhone;
            //force logout
            service.logout();

            if (authMode == "REPO") {
               // registration.UserEmail = "test@ey.com";
                return $http.post(appSettings.apiBaseUri + 'api/account/Register', registration).then(function (response) {
                    return response;
                });
            }
            else {
                return $http.post(appSettings.apiBaseUri + 'api/account/RegisterADUser', registration).then(function (response) {
                    return response;
                });
            }
        };

        //This saves the url requested
        this.saveAttemptUrl = function () {
            if (location.hash != "" && !location.hash.toLowerCase().contains('token') && !location.hash.toLowerCase().contains('#/login')) {
                redirectToUrlAfterLogin.url = location.hash;
            }
        };

        //Redirect to specified url
        this.redirectToAttemptedUrl = function (url) {
            location.hash = '#/home';
            //if (!angular.isUndefined(url) && url != '') {
            //    location.hash = url;
            //}
            //else {
            //    location.hash = redirectToUrlAfterLogin.url;
            //}
        };
        //VALIDATE AD USER
        this.validateADUser = function (userData) {
            return $http.post(appSettings.apiBaseUri + 'api/account/validateADUser', userData).then(function (response) {
                return response;
            });
        };

        //Azure AD Login
        this.AzureADLogin = function (userName, azureAdtoken) {
            var authData = "grant_type=password&username=" + userName + "&password=" + azureAdtoken;
            authData = authData + "&client_id=" + localStorageService.get('ClientId').ClientId;
            var deferred = $q.defer();
            var tmpData = {};

            $http.post(appSettings.apiBaseUri + 'token', authData, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Access-Control-Allow-Origin': '*',
                    //'Origin': localStorageService.get('Origin').Origin,
                    'Domain': localStorageService.get('Domain').Domain
                }
            }).then(function (response) {
                //set local storage data with TOKEN only for AuthInterceptorService to pick it up
                localStorageService.set('authorizationTFAData', {
                    token: response.data.access_token
                });

                userInfo = {
                    accessToken: response.data.access_token,
                    userName: response.data.userName,
                    refreshToken: response.data.refresh_token
                };
                localStorageService.set('userSessionId', {
                    userSessionId: response.data.userSessionId
                });
                service.setTokenInfo(userInfo);

                //set temp auth data
                _authentication.isAuth = true;
                _authentication.userName = userName;

                //hold response as temp data
                tmpData = response.data;
                return $http.post(appSettings.apiBaseUri + 'api/account/TFACheck', {}, {
                    headers: { 'X-OTP': 'false', 'Access-Control-Allow-Origin': '*' }
                });

            }).then(function (response) {

                //set local storage data Full
                localStorageService.set('authorizationTFAData', {
                    token: tmpData.access_token,
                    userName: tmpData.userName,
                    roles: tmpData.roles,
                    roleNames: tmpData.roleNames,
                    userInRoles: tmpData.userInRoles,
                    switchRole: tmpData.switchRole,
                    switchRoleName: tmpData.switchRoleName,
                    id: tmpData.id,
                    actions: tmpData.actions,
                });


                //Set User Session Data 
                $rootScope.global.setUserSessionData(
                    {
                        profilePicURI: tmpData.profilePicURI,
                        userName: tmpData.userName,
                        firstName: tmpData.firstName,
                        lastName: tmpData.lastName,
                        userRoles: tmpData.roleNames,
                        userInRoles: tmpData.userInRoles,
                        roles: tmpData.roles,
                        switchRole: tmpData.switchRole,
                        switchRoleName: tmpData.switchRoleName,
                        id: tmpData.id,
                    });


                //fill Auth Data for session use and accessibility
                service.fillAuthData();

                //Start Notification Hub
                $.signalR.ajaxDefaults.headers = { Authorization: "Bearer " + tmpData.access_token }; //HACK               
                notificationHubService.start("LOGIN"); // not implemented yet so commented for fixing the console error

                deferred.resolve(response);

            }).catch(function (err) {

                if ((err.status !== 200) && _authentication.isAuth) {
                    service.logout();
                }
                deferred.reject(err);
            });

            return deferred.promise;

        };


        // LOGIN
        this.login = function (loginData) {

            var authData = "grant_type=password&username=" + loginData.userName + "&password=" + loginData.password;
            authData = authData + "&client_id=" + localStorageService.get('ClientId').ClientId;

            var deferred = $q.defer();
            var tmpData = {};

            $http.post(appSettings.apiBaseUri + 'token', authData, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Domain': localStorageService.get('Domain').Domain
                }
            }).then(function (response) {

                //set local storage data with TOKEN only for AuthInterceptorService to pick it up
                localStorageService.set('authorizationTFAData', {
                    token: response.data.access_token
                });

                userInfo = {
                    accessToken: response.data.access_token,
                    userName: response.data.userName,
                    refreshToken: response.data.refresh_token
                };
                localStorageService.set('userSessionId', {
                    userSessionId: response.data.userSessionId
                });
                service.setTokenInfo(userInfo);


                //set temp auth data
                _authentication.isAuth = true;
                _authentication.userName = loginData.userName;

                //hold response as temp data
                tmpData = response.data;

                return $http.post(appSettings.apiBaseUri + 'api/account/TFACheck', {}, {
                    headers: { 'X-OTP': loginData.TFA }
                });

            }).then(function (response) {

                //set local storage data Full
                localStorageService.set('authorizationTFAData', {
                    token: tmpData.access_token,
                    userName: tmpData.userName,
                    roles: tmpData.roles,
                    id: tmpData.id,
                    actions: tmpData.actions,
                });
               
                //Set User Session Data 
                $rootScope.global.setUserSessionData(
                    {
                        profilePicURI: tmpData.profilePicURI,
                        firstName: tmpData.firstName,
                        lastName: tmpData.lastName
                    });


                //fill Auth Data for session use and accessibility
                service.fillAuthData();

                //Start Notification Hub
                $.signalR.ajaxDefaults.headers = { Authorization: "Bearer " + tmpData.access_token }; //HACK
                notificationHubService.start("LOGIN");

                deferred.resolve(response);
                
            }).catch(function (err) {

                if ((err.status !== 200) && _authentication.isAuth) {
                    service.logout();
                }
                deferred.reject(err);
            });

            return deferred.promise;
        };


        // Invalidate the current user Session
        this.InValidateUserSession = function () {
            var userSessionId = localStorageService.get('userSessionId').userSessionId;
            var param = { userSessionId: userSessionId };
            if (service.authentication.id != undefined) {
                $.ajax({
                    type: 'POST',
                    cache: false,
                    url: appSettings.apiBaseUri + 'api/account/InValidateUserSession',
                    dataType: 'json',
                    async: false,
                    data: { userName: service.authentication.userName },
                });
            }          
        };

        // RESUME SESSION
        this.resumeSession = function (moduleId) {
            //service.refreshToken(moduleId);
        };

        // LOGOUT
        this.logout = function () {
            if (service.authentication.id != undefined) {
                var userSessionId = localStorageService.get('userSessionId').userSessionId;
                var refreshTocken = JSON.parse($window.sessionStorage["TokenInfo"]).refreshToken;
                var param = { userName: service.authentication.userName, refreshTocken: refreshTocken, userSessionId: userSessionId };
                $.ajax({
                    type: 'POST',
                    cache: false,
                    url: appSettings.apiBaseUri + 'api/account/LogoutUser',
                    dataType: 'json',
                    async: false,
                    data: { userName: service.authentication.userName },
                });
                tokenInfo = null;
                $window.sessionStorage["TokenInfo"] = null;
            }
            localStorageService.remove('authorizationTFAData');
            localStorageService.remove('ModuleId');
            $rootScope.moduleName = '';
            $rootScope.global.removeUserSessionData();
            _authentication = { isAuth: false };

            service.authentication = _authentication;

            //Disconnect from Notification Hub
            if ($rootScope.hub) {
                notificationHubService.stop();
            }
        };


        // FILL AUTH DATA FROM LOCAL STORAGE (SESSION)
        this.fillAuthData = function () {
            var authSessionData = localStorageService.get('authorizationTFAData');
            if (authSessionData) {

                //Fillin Auth data to be accessible via AuthService only
                service.authentication = {
                    isAuth: true,
                    id: authSessionData.id,
                    userName: authSessionData.userName,
                    roles: authSessionData.roles,
                    actions: authSessionData.actions,

                }
            }

            //read all system action tags
            //service.readActionTags();
        };

        this.getUserRolesForModule = function (moduleId) {

            var $defer = $q.defer();
            var $url = appSettings.apiBaseUri + 'api/ModuleMgmt/GetUserModuleRolesById?moduleId=' + moduleId;

            $http({
                method: 'GET',
                url: $url
            }).then(function (response) {
                $defer.resolve(response);
            }).catch(function (err) {
                $defer.reject(err);
            });
            return $defer.promise;
        };

        this.fillAuthDataForSelectedmodule = function (userRoles, userRoleActions) {
            var authSessionData = localStorageService.get('authorizationTFAData');
            if (authSessionData) {
                //authSessionData.roles = userRoles;
                //authSessionData.actions = userRoleActions;
                service.authentication = {
                    isAuth: true,
                    id: authSessionData.id,
                    userName: authSessionData.userName,
                    roles: userRoles,
                    actions: userRoleActions
                };                
                var newUserSessionData = angular.copy(authSessionData);
                newUserSessionData.roles = userRoles;
                newUserSessionData.actions = userRoleActions;


                localStorageService.set('authorizationTFAData', newUserSessionData);
                //sessionStorage.setItem("authorizationTFAData", authSessionData);
            }
        };


        //REQUEST PASSWORD RESET
        this.requestPasswordReset = function (resetData) {
            //force logout
            service.logout();
            resetData.domain = loginType;
            var fullUrl = appSettings.apiBaseUri + 'api/account/RequestPasswordReset';
            return $http.post(appSettings.apiBaseUri + 'api/account/RequestPasswordReset', resetData)

                .then(function (response) {
                    return response;
                });
        };


        //CONFIRM EMAIL (LINK ACCESS)
        this.confirmEmail = function (id, token) {
     
            //force logout
            service.logout();

            return $http.post(appSettings.apiBaseUri + 'api/account/ConfirmEmail', { id: id, token: token }).then(function (response) {
                return response;
            });
        };


        //CONFIRM PASSWORD RESET (LINK ACCESS)
        this.confirmPasswordReset = function (id, token, password, confirmPassword) {

            //force logout
            service.logout();

            return $http.post(appSettings.apiBaseUri + 'api/account/ConfirmPasswordReset', { id: id, token: token, password: password, confirmPassword: confirmPassword })
                .then(function (response) {
                    return response;
                });
        };


        //START HUB NOTIFICATION
        this.startNotificationHub = function () {
            if (service.authentication.isAuth && !$rootScope.hub) {
                //Connect to Notification Hub
                var authSessionData = localStorageService.get('authorizationTFAData');
                if (authSessionData) {
                    $.signalR.ajaxDefaults.headers = { Authorization: "Bearer " + authSessionData.token }; //HACK
                    notificationHubService.start("SNH");
                }
            }
        };


        this.isNotificationHubOnline = function () {
            return notificationHubService.isHubConnected;
        };


        // GET TABLEAU TICKET
        this.getTableauTicket = function (actionTag, site) {
            var deferred = $q.defer();

            //Init action Tag from $state if it's not passed
            actionTag = angular.isUndefined(actionTag) ? $state.current.data.actionTag : actionTag;

            $http.get(appSettings.apiBaseUri + "api/Account/GetTableauTicket", { params: { elementActionTag: actionTag, site: site } })
                .success(function (result) {
                    deferred.resolve(result)
                }).error(function (response) {
                    deferred.reject(response);
                });

            return deferred.promise;
        };

        // GET DASHBOARD MENU
        this.getDashboardMenu = function (moduleId) {
            var deferred = $q.defer();
            $http.get(appSettings.apiBaseUri + "api/NavigationMgmt/Setup/TriageNav/LoadActiveItem?moduleId=" + moduleId)
                .success(function (result) {
                    deferred.resolve(result)
                }).error(function (response) {
                    deferred.reject(response);
                });
            return deferred.promise;
        }


        // GET Dynamic MENU
        this.getDynamicMenu = function (moduleId) {          
            var deferred = $q.defer();
            $http.get(appSettings.apiBaseUri + "api/NavigationMgmt/Setup/TriageNav/LoadDynamicMenu?moduleId=" + moduleId)
                .success(function (result) {
                    deferred.resolve(result)
                }).error(function (response) {
                    deferred.reject(response);
                });
            return deferred.promise;
        }

        //GET Triage View Definitions
        this.getAlertTriageMenu = function (fetchInactive) {
            var $defer = $q.defer();

            var $url = appSettings.apiBaseUri + 'api/AlertTriage/LoadViewDefs';

            $http({
                method: 'GET',
                url: $url,
                params: { fetchInactive: fetchInactive }
            }).then(function (response) {

                $defer.resolve(response.data);

            }).catch(function (err) {
                $defer.reject(err);
            });
            return $defer.promise;
        };

        // GET DASHBOARD MENU 
        this.getTabMenu = function (defType, friendlyId) {
            var $defer = $q.defer();
            var $url;
            switch (defType)
            {
                case 'NAVIGATION-OR-DEF':
                    $url = appSettings.apiBaseUri + "api/NavigationMgmt/Setup/OrgRpt/LoadActiveItem";
                    break;
                case 'NAVIGATION-PGM-DEF':
                case 'NAVIGATION-PGM-REL-ENG-DEF':
                case 'NAVIGATION-PGM-REL-PORTF-DEF':
                    $url = appSettings.apiBaseUri + "api/NavigationMgmt/Setup/PgmDash/LoadActiveItem/?defType=" + defType;
                    break;
                case 'RELATIVITY-DASHBOARD-DEF':
                    $url = appSettings.apiBaseUri + "api/NavigationMgmt/Setup/PgmDash/LoadActiveItem/?defType=" + friendlyId;
                    break;
                case 'NAVIGATION-EM-DEF':
                    $url = appSettings.apiBaseUri + "api/NavigationMgmt/Setup/EmployeeNav/LoadActiveItem";
                    break;
               case 'NAVIGATION-ENM-DEF':
                    $url = appSettings.apiBaseUri + "api/NavigationMgmt/Setup/EntityNav/LoadActiveItem";
                    break;
                case 'NAVIGATION-HCP-DEF':
                    $url = appSettings.apiBaseUri + "api/NavigationMgmt/Setup/HCPNav/LoadActiveItem";
                    break;
                default:
                    $url = appSettings.apiBaseUri + "api/NavigationMgmt/Setup/DataDash/LoadActiveItem";
                    break;
            }

            $http({
                method: 'GET',
                url: $url,
            }).then(function (response) {
                $defer.resolve(response.data);
            }).catch(function (err) {
                $defer.reject(err);
            });
            return $defer.promise;
        }

        this.getRelativityDashboardMenu = function (defType) {
            var $defer = $q.defer();

            $http({
                method: 'GET',
                url: appSettings.apiBaseUri + "api/NavigationMgmt/Setup/PgmDash/LoadRelDashboardMenuItems/?defType=" + defType
            }).then(function (response) {
                $defer.resolve(response.data);
            }).catch(function (err) {
                $defer.reject(err);
            });
            return $defer.promise;
        };
        //GET ACTION TAGS JSON FILE       

        this.getActionTags = function () {
            var $defer = $q.defer();
            var $url = 'Content/data/actionTags.json';//appSettings.actionTagsFile;
            $http({
                method: 'GET',
                url: $url,
            }).then(function (response) {
                $defer.resolve(response.data);
            }).catch(function (err) {
                $defer.reject(err);
            });
            return $defer.promise;
        };

        //Reads the action tags json
        this.readActionTags = function () {
             $http.get(appSettings.apiBaseUri + "api/Roles/LoadActionTagMappings")
                .then(function (response) {
                    systemActionTags = angular.fromJson(response.data.actionTag);
                    if (systemActionTags) {
                        localStorageService.set('systemActionTags', systemActionTags);
                    }
                });           
        };

        // CHECK FOR USER ACTION TAGS
        this.actionTagCounter = 0;
        this.hasActionAccess = function (param) {

            if (!systemActionTags && this.actionTagCounter == 0) {               
                systemActionTags = localStorageService.get('systemActionTags');
                this.actionTagCounter++;
            }
           
            var blnFlag = false;
            if (!angular.isUndefined(systemActionTags) && !angular.isUndefined(systemActionTags.filter(function (result) { return result.param === param }))) {
                // Element will be displayed for super user role
                var currentRoles = service.authentication.roles;
                if (!currentRoles) {                   
                    return;
                }
                 if(currentRoles.contains('Super')) {
                        blnFlag = true;
                    }
                    else {
                        //getting actions assigned to the user from authservice  
                        var actionTagObj = JSON.parse(service.authentication.actions);

                        var falseActions = actionTagObj.filter(function (a) { return a.Allow == false });
                        var trueActions = actionTagObj.filter(function (a) { return a.Allow == true });

                        for (var j = 0; j < falseActions.length; j++) {
                            blnFlag = true;
                            for (var k = 0; k < falseActions[j].Actions.length; k++) {
                                var actionsTag = falseActions[j].Actions[k];
                                // getting data-actionTag of the html element
                                if (systemActionTags.filter(function (result) { return result.param === param }).length > 0) {
                                    var elementActionTagValue = systemActionTags.filter(function (result) { return result.param === param })[0].actionTag;
                                    // Element will be displayed for wildcard action tags
                                    if (actionsTag.indexOf("*", actionsTag.length - 1) == -1 && elementActionTagValue == actionsTag) {
                                        blnFlag = false;
                                        break;
                                    }
                                    else if (actionsTag.indexOf("*", actionsTag.length - 1) != -1 && elementActionTagValue.indexOf(actionsTag.slice(0, -2), 0) == 0) {
                                        blnFlag = false;
                                        break;
                                    }
                                }
                            }
                        }

                        for (var j = 0; j < trueActions.length; j++) {
                            for (var k = 0; k < trueActions[j].Actions.length; k++) {

                                var actionsTag = trueActions[j].Actions[k];
                                if (systemActionTags.filter(function (result) { return result.param === param }).length > 0) {
                                    // getting data-actionTag of the html element
                                    var elementActionTagValue = systemActionTags.filter(function (result) { return result.param === param })[0].actionTag;
                                    // Element will be displayed for wildcard action tags
                                    if (actionsTag.indexOf("*", actionsTag.length - 1) == -1 && elementActionTagValue == actionsTag) {
                                        blnFlag = true;
                                        break;
                                    }
                                    else if (actionsTag.indexOf("*", actionsTag.length - 1) != -1 && elementActionTagValue.indexOf(actionsTag.slice(0, -2), 0) == 0) {
                                        blnFlag = true;
                                        break;
                                    }
                                }
                            }
                        }
                    }
                
 
                
            }
            return blnFlag;
        }

        //ACTION: Set token information to session storage
        this.setTokenInfo = function (data) {
            tokenInfo = data;
            $window.sessionStorage["TokenInfo"] = JSON.stringify(tokenInfo);
        }
        //ACTION: Get token information from variable
        this.getTokenInfo = function () {
            return tokenInfo;
        }
        //ACTION: Remove token
        this.removeToken = function () {
            tokenInfo = null;
            $window.sessionStorage["TokenInfo"] = null;
        }


        //ACTION: Set header
        this.setHeader = function (http) {
            delete http.defaults.headers.common['X-Requested-With'];
            if ((tokenInfo != undefined) && (tokenInfo.accessToken != undefined) && (tokenInfo.accessToken != null) && (tokenInfo.accessToken != "")) {
                http.defaults.headers.common['Authorization'] = 'Bearer ' + tokenInfo.accessToken;
                http.defaults.headers.common['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';
            }
        }

        this.getGeneralConfigData = function () {

            var $defer = $q.defer();
            var $url = appSettings.apiBaseUri + 'api/Account/GetGeneralConfig';

            $http({
                method: 'GET',
                url: $url,
            }).then(function (response) {

                $defer.resolve(response.data);

            }).catch(function (err) {
                urlSecureService.urlSecure(err);
                $defer.reject(err);
            });
            return $defer.promise;
        };





        //ACTION: Refresh token
        this.refreshToken = function (moduleId) {     
           
            var loginServiceURL = appSettings.apiBaseUri + 'token';
            var deferred = $q.defer();
            var token = this.getTokenInfo();
            var data = "grant_type=refresh_token&refresh_token=" + token.refreshToken;
            data = data + "&client_id=" + localStorageService.get('ClientId').ClientId + "&moduleId=" + moduleId;
            $http.post(loginServiceURL, data).success(function (response) {

                var o = response;
                var userInfo = {
                    accessToken: response.access_token,
                    userName: response.userName,
                    refreshToken: response.refresh_token
                };
                //set local storage data with TOKEN only for AuthInterceptorService to pick it up
                localStorageService.set('authorizationTFAData', {
                    token: response.access_token,
                    userName: response.userName,
                    roles: response.roles,
                    roleNames: response.roleNames,
                    userInRoles: response.userInRoles,
                    switchRole: response.switchRole,
                    switchRoleName: response.switchRoleName,
                    id: response.id,
                    actions: response.actions,
                });
                service.setTokenInfo(userInfo);
                service.setHeader($http);
                if (notificationHubService) {
                    notificationHubService.hub.connection.qs['token'] = response ? response.access_token : '';
                }
                //hasHttpRequest = false;
                deferred.resolve(null);
            }).error(function (err, status) {

                deferred.resolve(err);
            });
            return deferred.promise;
        }

        this.init = function () {
            if ($window.sessionStorage["TokenInfo"]) {
                tokenInfo = JSON.parse($window.sessionStorage["TokenInfo"]);
            }
        }

        this.init();

        return service;
    }

})(angular.module('common.modules'));
