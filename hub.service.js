//Hub setup

(function (app) {
    'use strict';

    app.factory('notificationHubService', notificationHubService);

    notificationHubService.$inject = ['$rootScope', 'Hub', 'appSettings', 'localStorageService'];
    function notificationHubService($rootScope, Hub, appSettings, localStorageService) {

        var service = {};
        service.hub = null;
        var retriesCount = 0;
        service.start = function (id) {
            $rootScope.hub = false;

            var authSessionData = localStorageService.get('authorizationTFAData');

            service.hub = new Hub('NotificationHub', {

                //Non default root-path
                rootPath: appSettings.apiBaseUri + '/signalr/hubs',
                transport: ['webSockets', 'longPolling'],
                //transport: ['webSockets', 'longPolling'],
                queryParams: {
                    'token': (authSessionData != null ? authSessionData.token : '')
                },

                //Connection State Handlers
                stateChanged: function (state) {
                    switch (state.newState) {
                        case $.signalR.connectionState.connecting:
                            console.log("Hub: Connecting...");
                            break;
                        case $.signalR.connectionState.connected:
                            retriesCount = 0;
                            console.log("Hub: Connected:", state);
                            break;
                        case $.signalR.connectionState.reconnecting:
                            service.hub.connection.qs['token'] = authSessionData != null ? authSessionData.token : '';
                            console.log("Hub: Reconnecting...");
                            break;
                        case $.signalR.connectionState.disconnected:
                            console.log("Hub: Disconnected");
                            //console.error("Last Hub ERROR:", service.hub.connection.lastError);
                            if (service.hub.connection.lastError && retriesCount < 20) {
                                retriesCount++;
                                service.hub.connection.start();
                            }
                            break;
                    }
                },

                //Client Methods Listeners
                listeners: {
                    'updateNotifications': function () {
                        if (!angular.isUndefined(service.updateNotificationsOnWidget)) {
                            service.updateNotificationsOnWidget();
                        }
                        if (!angular.isUndefined(service.updateNotificationsOnDashboard)) {
                            service.updateNotificationsOnDashboard();
                        }
                        if (!angular.isUndefined(service.updateNotificationsOnDataTable)) {
                            service.updateNotificationsOnDataTable();
                        }
                    },
                    //#region LinkAnalysis
                    'updateDataSourcesInfo': function () {
                        if (!angular.isUndefined(service.updateDataSourcesInfo)) {
                            service.updateDataSourcesInfo();
                        }
                    },
                    'updateGraphs': function () {
                        if (!angular.isUndefined(service.updateGraphs)) {
                            service.updateGraphs();
                        }
                    }
                    //#endregion LinkAnalysis
                    ,
                    //#region ReviewTool
                    'updateUploadFileStatusForReviewTool': function () {
                        if (!angular.isUndefined(service.updateUploadFileStatusForReviewTool)) {
                            service.updateUploadFileStatusForReviewTool();
                        }
                    },
                    'updateProcessFileStatusForReviewTool': function (noOverlayRecords, msg) {
                        if (!angular.isUndefined(service.updateProcessFileStatusForReviewTool)) {
                            service.updateProcessFileStatusForReviewTool(noOverlayRecords, msg);
                        }
                    },

                    'updateIndexingStatusForReviewTool': function () {
                        if (!angular.isUndefined(service.updateIndexingStatusForReviewTool)) {
                            service.updateIndexingStatusForReviewTool();
                        }
                    },
                    'deleteBatchSetStatusForReviewTool': function () {
                        if (!angular.isUndefined(service.deleteBatchSetStatusForReviewTool)) {
                            service.deleteBatchSetStatusForReviewTool();
                        }
                    },
                    'purgeBatchesStatusForReviewTool': function () {
                        if (!angular.isUndefined(service.purgeBatchesStatusForReviewTool)) {
                            service.purgeBatchesStatusForReviewTool();
                        }
                    },
                    'updateSearchTermReportStatusForReviewTool': function () {
                        if (!angular.isUndefined(service.updateSearchTermReportStatusForReviewTool)) {
                            service.updateSearchTermReportStatusForReviewTool();
                        }
                    },
                    //#endregion ReviewTool
                    //#region UDM Data Pipeline
                    'updateQueryStatusForUDM': function () {
                        if (!angular.isUndefined(service.updateQueryStatusForUDM)) {
                            service.updateQueryStatusForUDM();
                        }
                    },
                    'updateQueryStatusForSampling': function () {
                        if (!angular.isUndefined(service.updateQueryStatusForSampling)) {
                            service.updateQueryStatusForSampling();
                        }
                    }
                    ,
                    'updateProcessFileStatusForIngestion': function () {
                        if (!angular.isUndefined(service.updateProcessFileStatusForIngestion)) {
                            service.updateProcessFileStatusForIngestion();
                        }
                    },
                    'updateBatchSetStatusForReviewTool': function () {
                        if (!angular.isUndefined(service.updateBatchSetStatusForReviewTool)) {
                            service.updateBatchSetStatusForReviewTool();
                        }
                    }
                    //#endregion UDM Data Pipeline
                    ,
                    //#region Timeline View
                    'addEditDatasetStatusForTimelineView': function (datasetId, status, lastUpdatedDateTime) {
                        if (!angular.isUndefined(service.addEditDatasetStatusForTimelineView)) {
                            service.addEditDatasetStatusForTimelineView(datasetId, status, lastUpdatedDateTime);
                        }
                    },

                    //#region For Data Ingestion and pipeline execution
                    'updateDataIngestionStatus': function () {
                        if (!angular.isUndefined(service.updateDataIngestionStatus)) {
                            service.updateDataIngestionStatus();
                        }
                    },
                    'updateExecuteFileStatus': function () {
                        if (!angular.isUndefined(service.updateExecuteFileStatus)) {
                            service.updateExecuteFileStatus();
                        }
                    },
                    //#endregion
                    'updateRoleStatus': function (userIds, moduleId, userName) {
                        if (!angular.isUndefined(service.updateRoleStatus)) {
                            service.updateRoleStatus(userIds, moduleId, userName);
                        }
                    },
                    //#endregion
                    'updateModuleStatus': function (moduleId) {
                        if (!angular.isUndefined(service.updateModuleStatus)) {
                            service.updateModuleStatus(moduleId);
                        }
                    }
                },

                //Server Methods
                methods: [],
                errorHandler: function (error) {
                    //console.error("Hub error:",error);
                },
                //hubDisconnected: function () {
                //    if (service.hub.connection.lastError) {
                //        service.hub.connection.start();
                //    }
                //}
            });

            $rootScope.hub = true;

        };

        service.stop = function () {
            $rootScope.hub = false;
            service.hub.disconnect();
        }

        return service;

    };

})(angular.module('common.modules'));
