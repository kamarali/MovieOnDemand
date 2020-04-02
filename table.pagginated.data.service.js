(function (app) {
    'use strict';

    app.factory('tablePagginatedDataService',tablePagginatedDataService);
    tablePagginatedDataService.$inject = ['$http', '$filter', 'growlService', 'globalService'];

    function tablePagginatedDataService($http, $filter, growlService, globalService) {

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

        var service = {
            cachedData: [],

            getData: function ($defer, $url, $query, params, filter) {
                if (service.cachedData.length > 0) {

                    var filteredData = filterData(service.cachedData, filter);
                    var transformedData = sliceData(orderData(filteredData, params), params);
                    params.total(filteredData.length)
                    $defer.resolve(transformedData);
                }
                else {
                    $http({
                        method: 'POST',
                        url: $url,
                        data: $query
                    }).then(function (response) {
                        params.total(response.data.count);
                        var list = response.data.listOfItens;
                        //hide the pager control if the data is lessthan 10 records
                        params.settings({ counts: response.data.count > 10 ? [10, 25, 50, 100] : [] });
                        $defer.resolve(list);
                    }).catch(function (err) {
                        globalService.apiError(err, true);
                        //var message = err.data && err.data.error_description ? err.data.error_description : "Request encountered exception.";
                        //growlService.growl(message, 'danger');
                    });
                }

            }
        };
        return service;
    }
})(angular.module('common.modules'));
