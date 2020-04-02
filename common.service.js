(function (app) {
    'use strict';


    app.factory('growlService', growlService);

    function growlService() {

        var service = {};

        service.growl = function (message, type) {
            $.growl({
                message: message
            }, {
                type: type,
                allow_dismiss: false,
                label: 'Cancel',
                className: 'btn-xs btn-inverse',
                placement: {
                    from: 'top',
                    align: 'right'
                },
                delay: 2500,
                animate: {
                    enter: 'animated bounceIn',
                    exit: 'animated bounceOut'
                },
                offset: {
                    x: 20,
                    y: 85
                }
            });
        }

        return service;
    };



    app.factory('scrollService', scrollService);

    function scrollService() {
        var service = {
            malihuScroll: malihuScroll,
        };

        function malihuScroll(selector, theme, mousewheelaxis) {
            $(selector).mCustomScrollbar({
                theme: theme,
                scrollInertia: 100,
                axis:'yx',
                mouseWheel: {
                    enable: true,
                    axis: mousewheelaxis,
                    preventDefault: true
                }
            });
        }
        
        return service;
    }



    app.factory('apiService', apiService);
    apiService.$inject = ['$http', '$location', 'growlService', '$rootScope'];

    function apiService($http, $location, alertService, $rootScope) {
        var service = {
            get: get,
            post: post
        };

        function get(url, config, success, failure) {
            return $http.get(url, config)
                    .then(function (result) {
                        success(result);
                    }, function (error) {
                        if (error.status == '401') {
                            growlService.growl('Authentication required.', 'danger');
                        }
                        else if (failure != null) {
                            failure(error);
                        }
                    });
        }

        function post(url, data, success, failure) {
            return $http.post(url, data)
                    .then(function (result) {
                        success(result);
                    }, function (error) {
                        if (error.status == '401') {
                            growlService.growl('Authentication required.', 'danger');
                        }
                        else if (failure != null) {
                            failure(error);
                        }
                    });
        }

        return service;
    }



    app.factory('messageService', messageService);
    messageService.$inject = ['$resource'];

    function messageService($resource) {
        var service = {
            getMessage: getMessage,
        };

        function getMessage(img, user, text) {
            var gmList = $resource("Content/data/dummy.json");

            return gmList.get({
                img: img,
                user: user,
                text: text
            });
        }

        return service;
    }




})(angular.module('common.modules'));
