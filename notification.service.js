(function (app) {
	'use strict';

	app.factory('notificationService', notificationService);
	notificationService.$inject = ['$q', '$http', '$resource','appSettings'];

	function notificationService($q, $http, $resource, appSettings) {
	    var service = {};

	    // Get recent notifications items
	    service.getNotifications = function (skip, take, type) {
	        var $defer = $q.defer();

	        var $url = appSettings.apiBaseUri + 'api/NotificationController/LoadNotifications';

	        $http({
	            method: 'POST',
	            data: {
	                skip: skip,
	                take: take,
                    type: type
	            },
	            url: $url,
	        }).then(function (response) {
	            $defer.resolve(response.data);
	        }).catch(function (err) {
	            $defer.reject(err);
	        });
	        return $defer.promise;
	    }

        // Get recent notifications items
	    service.deletetNotificationsOutDated = function () {
	        var $defer = $q.defer();

	        var $url = appSettings.apiBaseUri + 'api/NotificationController/DeleteNotificationsOutdated';

	        $http({
	                method: 'POST',
	                data: {
	                },
	                url: $url,
	        }).then(function(response) {
	            $defer.resolve(response.data);
            }).catch(function (err) {
	            $defer.reject(err);
	        });
	        return $defer.promise;
	    }

	    service.setNotificationAsRead = function (id) {
	        var $defer = $q.defer();

	        var $url = appSettings.apiBaseUri + 'api/NotificationController/SetNotificationAsRead';

	        $http({
	            method: 'POST',
	            data: {
	                Id: id
	            },
	            url: $url,
	        }).then(function (response) {
	            $defer.resolve(response.data);
	        }).catch(function (err) {
	            $defer.reject(err);
	        });
	        return $defer.promise;
	    }

	    service.setAllNotificationAsRead = function () {
	        var $defer = $q.defer();

	        var $url = appSettings.apiBaseUri + 'api/NotificationController/SetAllNotificationAsRead';

	        $http({
	            method: 'POST',
	            url: $url,
	        }).then(function (response) {
	            $defer.resolve(response.data);
	        }).catch(function (err) {
	            $defer.reject(err);
	        });
	        return $defer.promise;
	    }

        service.setNotificationAsUnread = function (id) {
	        var $defer = $q.defer();

	        var $url = appSettings.apiBaseUri + 'api/NotificationController/SetNotificationAsUnread';

	        $http({
	            method: 'POST',
	            data: {
	                Id: id
	            },
	            url: $url,
	        }).then(function (response) {
	            $defer.resolve(response.data);
	        }).catch(function (err) {
	            $defer.reject(err);
	        });
	        return $defer.promise;
	    }

        service.deleteNotificationItem = function (id) {
	        var $defer = $q.defer();

	        var $url = appSettings.apiBaseUri + 'api/NotificationController/DeleteNotificationItem';

	        $http({
	            method: 'POST',
	            data: {
	                Id: id
	            },
	            url: $url,
	        }).then(function (response) {
	            $defer.resolve(response.data);
	        }).catch(function (err) {
	            $defer.reject(err);
	        });

	        return $defer.promise;
        }

        //Delete all notifications from server
        service.DeleteAllNotificationItems = function () {
            var $defer = $q.defer();

            var $url = appSettings.apiBaseUri + 'api/NotificationController/DeleteAllNotificationItems';

            $http({
                method: 'POST',
                url: $url,
            }).then(function (response) {
                $defer.resolve(response.data);
            }).catch(function (err) {
                $defer.reject(err);
            });
            return $defer.promise;
        }

		return service;
	};
})(angular.module('common.modules'));