(function (app) {
    'use strict';

    app.factory('tableDataService', tableDataService);
    tableDataService.$inject = ['$http', '$filter','$q', 'growlService', 'globalService'];

    function tableDataService($http, $filter,$q, growlService, globalService) {
        //#region For Relativity Integration: <START: Variable to check from which method has called the service>
        var callerPage = "";
        //#endregion For Relativity Integration: <END>

        function filterData(data, filter) {
            return $filter('filter')(data, filter)
        }

        function orderData(data, params) {
            return params.sorting() ? $filter('orderBy')(data, params.orderBy()) : data;
        }

        function sliceData(data, params) {
            return data.slice((params.page() - 1) * params.count(), params.page() * params.count())
        }

        function transformData(data, filter, params) {
            return sliceData(orderData(filterData(data, filter), params), params);
        }

        //#region For Relativity Integration: <START: Method to set the Active record at the top dispite of the filters and sortings>
        //This function is specifically written for Relativity Authentication Configuration list page
        //This sorts the list so that, the Active record will always be at the top dispite of the filters and sortings
        function shiftActiveRecord(transformedData) {
            var newRelAuthConfigsArray = [];

            for (var index = 0; index < transformedData.length; index++) {
                if (transformedData[index].isActive === true) {
                    //push active record as first record in array so that it shows up as first record always
                    newRelAuthConfigsArray.push(transformedData[index]);
                    //remove record from array
                    transformedData.splice(index, 1);
                    break;
                }
            }
            angular.forEach(transformedData, function (relAuthConfig) {
                newRelAuthConfigsArray.push(relAuthConfig);
            });
            return newRelAuthConfigsArray;
        }
        //#endregion For Relativity Integration: <END>

        //#region For Relativity Integration: <START: Sort the data AND if Service has been invoked by Relativitu Auth Config, shift the Active Record as First Record always>
        function orderDataRelativity(data, params) {
            var sortedData = params.sorting() ? $filter('orderBy')(data, params.orderBy()) : data;

            if (callerPage == "RelAuthConfigs") {
                sortedData = shiftActiveRecord(sortedData);
            }
            return sortedData;
        }
        //#endregion For Relativity Integration: <END>

        var service = {
            cachedData: [],
            getData: function ($defer, $url, $query, params, filter) {
                var defer = $q.defer();

                if (service.cachedData.length > 0) {

                    var filteredData = filterData(service.cachedData, filter);
                    var transformedData = sliceData(orderData(filteredData, params), params);
                    params.total(filteredData.length)
                    defer.resolve(transformedData);
                    return defer.promise;
                }
                else {
                    $http({
                        method: 'POST',
                        url: $url,
                        data: $query
                    }).then(function (response) {

                        params.total(response.data.length);
                        transformedData = params.sorting() ? $filter('orderBy')(response.data, params.orderBy()) : response.data;
                        transformedData = params.filter() ? $filter('filter')(transformedData, params.filter()) : transformedData.data;
                        params.total(transformedData.length)
                        transformedData = transformedData.slice((params.page() - 1) * params.count(), params.page() * params.count());


                        //don't use cache
                        //angular.copy(response, service.cachedData)

                        //Goto first Page if total is less than current page offset
                        if (params.total() < (params.page() - 1) * params.count()) {
                            params.page(1);
                        }
                        params.settings({ counts: params.total() > 10 ? [10, 25, 50, 100] : [] });


                        //params.total(transformedData.length)
                        //var filteredData = $filter('filter')(response.data, filter);
                        //var transformedData = transformData(response, filter, params)
                        //var transformedData = sliceData(orderData(response.data, params), params);
                        //hide the pager control if the data is lessthan 10 records
                        // params.settings({ counts: transformedData.length > 10 ? [10, 25, 50, 100] : [] });

                        defer.resolve(transformedData);
                    }).catch(function (err) {
                        globalService.apiError(err, true);
                    });
                    return defer.promise;
                }

            },
            getDataLA: function ($defer, $url, $query, params, filter, callbackData) {
                var defer = $q.defer();
                if (service.cachedData.length > 0) {

                    var filteredData = filterData(service.cachedData, filter);
                    var transformedData = sliceData(orderData(filteredData, params), params);
                    params.total(filteredData.length)
                    defer.resolve(transformedData);
                    return defer.promise;
                }
                else {
                    $http({
                        method: 'POST',
                        url: $url,
                        data: $query
                    }).then(function (response) {

                        params.total(response.data.length);
                        transformedData = params.sorting() ? $filter('orderBy')(response.data, params.orderBy()) : response.data;
                        transformedData = params.filter() ? $filter('filter')(transformedData, params.filter()) : transformedData.data;
                        params.total(transformedData.length)
                        transformedData = transformedData.slice((params.page() - 1) * params.count(), params.page() * params.count());


                        //don't use cache
                        //angular.copy(response, service.cachedData)

                        //params.total(transformedData.length)
                        //var filteredData = $filter('filter')(response.data, filter);
                        //var transformedData = transformData(response, filter, params)
                        //var transformedData = sliceData(orderData(response.data, params), params);
                        //hide the pager control if the data is lessthan 10 records
                        // params.settings({ counts: transformedData.length > 10 ? [10, 25, 50, 100] : [] });

                        if (callbackData) {
                            callbackData(response);
                        }

                        defer.resolve(transformedData);
                        return defer.promise;

                    }).catch(function (err) {
                        globalService.apiError(err, true);
                    });
                }

            },
            //#region For Relativity Integration: <START: Added caller page variable to getData method>
            getDataRelativity: function ($defer, $url, $query, params, filter, caller) {
                var defer = $q.defer();
                if (service.cachedData.length > 0) {

                    var filteredData = filterData(service.cachedData, filter);
                    var transformedData = sliceData(orderDataRelativity(filteredData, params), params);
                    params.total(filteredData.length)
                    defer.resolve(transformedData);
                    return defer.promise;

                }
                else {
                    $http({
                        method: 'POST',
                        url: $url,
                        data: $query
                    }).then(function (response) {

                        //don't use cache
                        //angular.copy(response, service.cachedData)
                        params.total(response.data.length)

                        //set the caller page
                        if (!angular.isUndefined(caller) && caller === "RelAuthConfigs") {
                            callerPage = caller;
                        }
                        var transformedData = sliceData(orderDataRelativity(response.data, params), params);
                        
                        //hide the pager control if the data is lessthan 10 records
                        params.settings({ counts: response.data.length > 10 ? [10, 25, 50, 100] : [] });

                        defer.resolve(transformedData);

                    }).catch(function (err) {
                        globalService.apiError(err, true);
                    });
                    return defer.promise;

                }
            }
            //#endregion For Relativity Integration: <END>
        };
        return service;
    }
})(angular.module('common.modules'));
