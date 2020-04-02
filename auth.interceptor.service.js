(function (app) {
    'use strict';

    app.factory('authInterceptorService', authInterceptorService);
    authInterceptorService.$inject = ['$q', '$injector', '$location','$rootScope', 'localStorageService', 'growlService'];

    function authInterceptorService($q, $injector, $location, $rootScope, localStorageService, growlService) {

        var service = {};

        var _request = function (config) {

            config.headers = config.headers || {};
            var origin = localStorageService.get('Origin').Origin;
            var authData = localStorageService.get('authorizationTFAData');
            if (authData) {
                config.headers.Authorization = 'Bearer ' + authData.token;
            }
            config.headers['Access-Control-Allow-Origin'] = origin;
            
            var moduleId = localStorageService.get('ModuleId');

            moduleId = $rootScope.getModuleId(moduleId);
            if (moduleId) {
                config.headers.moduleId = moduleId;
            }
            return config;
        }

        var _responseError = function (rejection) {

            if (rejection && rejection.data && rejection.data.code && rejection.data.code === 110) {
                if (localStorageService.get('ModuleId') != null) {
                    var $rootScope = $injector.get('$rootScope');
                    $rootScope.$broadcast("MODULE_ID_INVALID_ACCESS");
                    return $q.reject(rejection);
                }
            } else {
                if (rejection.status === 401 || (rejection.status === 400 && rejection.data.error === 'invalid_grant')) {

                    var authService = $injector.get('authService');
                    var $rootScope = $injector.get('$rootScope');
                    var notificationHubService = $injector.get('notificationHubService');

                    if (rejection.data.code && (
                        rejection.data.code === 100 ||
                        rejection.data.code === 101 ||
                        rejection.data.code === 102)) {
                        //Case that OTP is not valid but access token is valid
                        authService.logout();
                        $location.path('/login');
                    }
                    else if (rejection.data.code && rejection.data.code === 103) {
                        growlService.growl(rejection.data.message, 'danger');
                        window.history.back();
                    }
                    else if ((rejection.data.code && rejection.data.code === 104) ||
                        rejection.statusText === 'Unauthorized' ||
                        rejection.data.error === 'invalid_grant') { // Invalid session detected
                        $injector.get('Idle').unwatch();

                        //remove user session from localstorageservice, $rootScope and set authentication to false
                        localStorageService.remove('authorizationTFAData');
                        localStorageService.remove('ModuleId');
                        $rootScope.global.removeUserSessionData();
                        authService.authentication = { isAuth: false };

                        //Disconnect from Notification Hub
                        if ($rootScope.hub) {
                            notificationHubService.stop();
                        }

                        $injector.get('$state').go('logout');
                    }
                }
            }

            return $q.reject(rejection);
        }

        var _getToken = function () {
            var origin = localStorageService.get('Origin').Origin;
            var authData = localStorageService.get('authorizationTFAData');
            if (authData) {
                return { Authorization: 'Bearer ' + authData.token, 'Access-Control-Allow-Origin': origin, moduleId: localStorageService.get('ModuleId') };
            }
        }

        service.request = _request;
        service.responseError = _responseError;
        service.getToken = _getToken;

        return service;
    }

})(angular.module('common.modules'));
