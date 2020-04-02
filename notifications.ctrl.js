(function (app) {
    'use strict';

    app.controller('notificationsCtrl', notificationsCtrl);
    notificationsCtrl.$inject = ['$scope', '$state', '$location', '$stateParams', 'NgTableParams', 'tableDataService', 'appSettings', '$uibModal', '$http','stateMgmtService',
        'notificationHubService', 'notificationService', '$rootScope'];

    function notificationsCtrl($scope, $state, $location, $stateParams, NgTableParams, tableDataService, appSettings, $uibModal, $http, stateMgmtService,
        notificationHubService, notificationService, $rootScope) {

        var ctrl = this;

        this.notifications = [];
        //this.notificationsType = 1; // URL PARAMETER?????
        var stageParam = stateMgmtService.getPageParams();
        if (stageParam !== undefined) {
            this.localSortType = stageParam.localSortType;
            this.localSortAscending = stageParam.localSortAscending;
            this.localSearchText = "";
            this.localPageSize = stageParam.localPageSize;
            this.localPageNumber = stageParam.localPageNumber;
        }
        else {

            this.localSortType = 'LastUpdatedDateTime';
            this.localSortAscending = false;
            this.localSearchText = "";
            this.localPageSize = 10;
            this.localPageNumber = 1;
        }


        this.localSorting = {};
        ctrl.localSorting[ctrl.localSortType] = ctrl.localSortAscending ? 'asc' : 'desc';
        //Edit table row, it opens a new controller. On closing new page we are not able to maintain itemsPerPage. So we maintain it in rootscope variable.
        //=======================================
        if (angular.isUndefined($rootScope.notificationsPerpage)) {
            this.itemsPerPage = 10;
        }
        else {
            this.itemsPerPage = $rootScope.notificationsPerpage;
        }
        //=======================================
        //Initialize DATA TABLE
        this.tableParams = new NgTableParams(
        {
                page: 1,            // show first page
                count: ctrl.itemsPerPage  ,  // count per page
                sorting: { createdDateTime: 'desc' }
        },
        {
            total: 0, // length of data
            getData: function (params) {
                $rootScope.notificationsPerpage = params.count();
           

                var $url = appSettings.apiBaseUri + 'api/NotificationController/LoadAllNotifications';
                var $query = {                
                    page: params.page(),
                    per_page: params.count()
                };

               return tableDataService.getData(params, $url, $query, params, $scope.filter);
                
            }
        });
      
        function loadTable() {
            //Initialize DATA TABLE
            ctrl.tableParams = new NgTableParams(
                {
                    page: 1,            // show first page                 
                    count: ctrl.itemsPerPage  , // count per page
                    sorting: { createdDateTime: 'desc' }
                },
                {
                    total: 0, // length of data
                    getData: function (params) {
                        var sort = params.sorting();
                        var isSorting = false;
                        if (sort) {
                            if (sort.createdDateTime) {
                                isSorting = true;
                            }
                        }
                        $rootScope.notificationsPerpage = params.count();
                        var $url = appSettings.apiBaseUri + 'api/NotificationController/LoadAllNotifications';
                        var $query = {
                            page: params.page(),
                            per_page: params.count(),
                            isSorting: isSorting
                        };

                      return  tableDataService.getData(params, $url, $query, params, $scope.filter);


                    }
                });
        }

        this.init = function () {
            loadTable();
        }


        this.goToNotificationUrl = function (notification) {
            var param =
            {
                localPageSize: this.localPageSize,
                localPageNumber: this.tableParams.page(),
                localSortType: this.localSortType,
                localSortAscending: this.localSortAscending,
                previousPage: $state.current.name,
                previousPageParam: $stateParams.type                
            }
            stateMgmtService.addPageParams(param);
            notificationService.setNotificationAsRead(notification.id, false).then(function (result) {
                // do nothing yet
            }).catch(function (err) {
                $scope.global.apiError(err, "SWAL");
            });

            $location.path(notification.url);
        }

        this.deleteNotificationItem = function (id, title) {
            swal({
                title: "Are you sure?",
                text: "You are deleting notification item (" + title + ")",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#F44336",
                confirmButtonText: "Yes, delete!",
                closeOnConfirm: false
            }, function () {
                notificationService.deleteNotificationItem(id).then(function (response) {
                    swal("Done!", "Item is deleted", "success");
                    ctrl.tableParams.reload();
                    // do nothing yet
                }).catch(function (err) {
                    $scope.global.apiError(err, "SWAL");
                });
            });
        }

        this.setNotificationAsRead = function (notification) {
            swal({
                title: "Are you sure?",
                text: "You are marking as read notification item (" + notification.title + ")",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#F44336",
                confirmButtonText: "Yes, mark as read!",
                closeOnConfirm: false
            }, function () {
                notificationService.setNotificationAsRead(notification.id, false).then(function (response) {
                    swal("Done!", "Item is marked as read", "success");
                    ctrl.tableParams.reload();
                    // do nothing yet
                }).catch(function (err) {
                    $scope.global.apiError(err, "SWAL");
                });
            });
        }

        this.setNotificationAsUnread = function (notification) {
            swal({
                title: "Are you sure?",
                text: "You are marking as unread notification item (" + notification.title + ")",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#F44336",
                confirmButtonText: "Yes, mark as unread!",
                closeOnConfirm: false
            }, function () {
                notificationService.setNotificationAsUnread(notification.id, false).then(function (response) {
                    swal("Done!", "Item is marked as unread", "success");
                    ctrl.tableParams.reload();
                    // do nothing yet
                }).catch(function (err) {
                    $scope.global.apiError(err, "SWAL");
                });
            });
        }

        notificationHubService.updateNotificationsOnDataTable = function () {
            ctrl.tableParams.page(1);
            ctrl.tableParams.reload();
        }


        // Action: sort the  notifications.
        // if the sortType is the same as the last time, change the ascending to descending or vice versa.
        // for Title and Done: if the sortType is the same as the last time and the ascending is already set to false (descending) then, get back to the 'LastUpdatedDateTime' and set ascending to false.
        // for other fields: if the sortType is the same as the last time and the ascending is already set to true (ascending) then, get back to the 'LastUpdatedDateTime' and set ascending to false.
        // if the sortType is different for the last time, set the ascending to true if the fields is Title or Done, or set ascending to false otherwise.
        this.sortNotifications = function (sortType) {
            if (ctrl.localSortType == sortType) {
                switch (ctrl.localSortType) {
                    case 'Title':
                    case 'Status':
                        if (this.localSortAscending == false) {
                            ctrl.localSortAscending = false;
                            ctrl.localSortType = 'LastUpdatedDateTime';
                        } else {
                            ctrl.localSortAscending = !ctrl.localSortAscending;
                        }
                        break;
                    default:
                        if (this.localSortAscending == true) {
                            ctrl.localSortAscending = false;
                            ctrl.localSortType = 'LastUpdatedDateTime';
                        } else {
                            ctrl.localSortAscending = !ctrl.localSortAscending;
                        }
                        break;
                }
            } else {
                ctrl.localSortType = sortType;
                // load the default order
                switch (sortType) {
                    case 'Title':
                    case 'Status':
                        ctrl.localSortAscending = true;
                        break;
                    default:
                        ctrl.localSortAscending = false;
                        break;
                }
            }
            var sorting = {};
            sorting[ctrl.localSortType] = ctrl.localSortAscending ? 'asc' : 'desc';
            ctrl.tableParams.sorting(sorting);
            ctrl.tableParams.reload();
        }

        // Action: Press enter at the search text
        this.changeSearchText = function () {
            ctrl.tableParams.reload();
        }

        this.cleanSearchText = function () {
            ctrl.localSearchText = "";
            ctrl.tableParams.reload();
        }

        this.init();

    };

})(angular.module('common.modules'));