(function (app) {
    'use strict';

    app.factory('globalService', globalService);

    globalService.$inject = ['$state', '$rootScope', 'localStorageService', 'growlService', 'stateMgmtService', '$q', '$http', 'appSettings'];

    function globalService($state, $rootScope, localStorageService, growlService, stateMgmtService, $q, $http, appSettings) {
        var service = {};

        service.getCountries = function (caseId) {
            var $defer = $q.defer();

            var $url;

            $url = appSettings.apiBaseUri + 'api/MasterDataMgmt/Setup/GetCountries';

            $http({
                method: 'GET',
                url: $url,
                params: {}
            }).then(function (response) {

                $defer.resolve(response.data);
            }).catch(function (err) {
                $defer.reject(err);
            });
            return $defer.promise;
        };

        //Master configuration data retrieval
        service.getMasterconfiguration = function () {
            var $defer = $q.defer();

            var $url = appSettings.apiBaseUri + 'api/CaseMgmt/Setup/GeneralConfig/LoadActiveItem';

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

        service.GoBack = function () {
            var params = stateMgmtService.getPrevStates();
            stateMgmtService.setState(false);
            $state.go(params.previousPage, params.previousParameters)
        };


        service.apiErrorCodeProcessed = function (err) {
            if (typeof err.data.code !== 'undefined' && err.data.code == 103) return true;
            else return false;
        }


        service.apiError = function (err, showOption) {

            var errorMsg = "";
            if (!angular.isUndefined(err.data) && err.data) {
                if (err.data.modelState) {
                    var errors = [];
                    for (var key in err.data.modelState) {
                        for (var i = 0; i < err.data.modelState[key].length; i++) {
                            errors.push(err.data.modelState[key][i]);
                        }
                    }
                    errorMsg = errors.slice(0, 2).join("\n") + (errors.length > 2 ? "..." : "");
                }
                else if (err.data.error_description) {
                    errorMsg = err.data.error_description;
                }
                else if (err.data.message) {
                    errorMsg = err.data.message;
                }
            }
            else if (!angular.isUndefined(err.message) && err.message) {
                errorMsg = err.message;
            }
            else if (!angular.isUndefined(err) && err) {
                errorMsg = err;
            }
            else {
                errorMsg = "Application has encountered an unexpected error. Please try again later.";
            }

            if (typeof showOption !== 'undefined') {
                //suppress growl/swal for code 103
                if (!angular.isUndefined(err.data) && !angular.isUndefined(err.data.code)  && err.data.code == 103) return;

                if (showOption === "SWAL") {
                    swal({ html: true, title: 'Error!', text: errorMsg, type: 'error' });
                }
                else {
                    growlService.growl(errorMsg, 'danger');
                }
            }
            else {
                return errorMsg;
            }
        }


        service.setUserSessionData = function (sessionData) {
            localStorageService.set('userSessionData', sessionData);

            //reset $rootScope user session
            $rootScope.UserSession = sessionData;
        }


        service.getUserSessionData = function () {
            var userSessionData = localStorageService.get('userSessionData');
            if (userSessionData) {
                $rootScope.UserSession = userSessionData;
            }
        }


        service.removeUserSessionData = function () {
            localStorageService.remove('userSessionData');
            //reset $rootScope user session
            $rootScope.UserSession = {};
        }


        service.codemirrorDefaults = function () {
            return {
                mode: 'application/ld+json',
                lineNumbers: true,
                matchBrackets: true,
                styleActiveLine: true,
                readOnly: true
            };
        }

        service.codemirrorSQLDialect = function() {
            return {
                mode: 'text/x-mssql',
                lineNumbers: true,
                lineSeparator: "\n",
                matchBrackets: true,
                styleActiveLine: true,
                readOnly: true,
                lineWrapping: true
            };
        }

        //#region LinkAnalysis
        //Fullscreen View
        service.fullScreen = function (elementId) {

            var rootElement = document.documentElement;

            if (!angular.isUndefined(elementId)) {
                rootElement = document.getElementById(elementId);
            }

            function isEnabled() {
                var d = document;
                if (
                    d.fullscreenElement ||
                        d.webkitFullscreenElement ||
                        d.mozFullScreenElement
                )
                    return 1;
                else return 0;
            }

            //Launch
            function launchIntoFullscreen(element) {
                if (element.requestFullscreen) {
                    element.requestFullscreen();
                } else if (element.mozRequestFullScreen) {
                    element.mozRequestFullScreen();
                } else if (element.webkitRequestFullscreen) {
                    element.webkitRequestFullscreen();
                } else if (element.msRequestFullscreen) {
                    element.msRequestFullscreen();
                }
            }

            //Exit
            function exitFullscreen() {
                if (isEnabled()) {
                    if (document.exitFullscreen) {
                        document.exitFullscreen();
                    } else if (document.mozCancelFullScreen) {
                        document.mozCancelFullScreen();
                    } else if (document.webkitExitFullscreen) {
                        document.webkitExitFullscreen();
                    }
                }
            }

            if (exitFullscreen()) {
                launchIntoFullscreen(rootElement);
            }
            else {
                launchIntoFullscreen(rootElement);
            }
        }
        //#endregion LinkAnalysis
        return service;
    }




})(angular.module('common.modules'));
