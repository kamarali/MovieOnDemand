(function (app) {
    'use strict';

    app.factory('caseFileUploadService', caseFileUploadService);
    caseFileUploadService.$inject = ['$http', 'appSettings', 'authInterceptorService', '$q'];

    function caseFileUploadService($http, appSettings, authInterceptorService, $q) {

        var service = {};
        var defaultmaxFilesize = 1024;
        var vaidFormats = '';
        var maxFileCount = 10;

        //Fetch General Configurations.
        service.getGeneralConfigData = function () {

            var $defer = $q.defer();
            var $url = appSettings.apiBaseUri + 'api/FileUpload/GetGeneralConfig';

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

        service.getDzOptions = function (Filesize, FileCount) {
            return {
                dictRemoveFile: 'Remove file',
                dictResponseError: 'Could not upload this file',
                autoProcessQueue: false,
                uploadMultiple: true,
                parallelUploads: 10,
                maxFiles: FileCount,
                maxFilesize: Filesize,  //allowing 1000MB
                filesizeBase: 1024,
                paramName: "files",
                autoDiscover: false,
                addRemoveLinks: true,
                headers: authInterceptorService.getToken(),
            };
        };

        //Load the list of Files
        service.loadFiles = function (id) {
            var $defer = $q.defer();
            var $url = appSettings.apiBaseUri + 'api/FileUpload/LoadFiles';

            $http({
                method: 'POST',
                url: $url,
                data: { id: id }
            }).then(function (response) {
                $defer.resolve(response);
            }).catch(function (err) {
                $defer.reject(err);
            });
            return $defer.promise;
        };

        service.removeFile = function (requestID) {
      
            var $defer = $q.defer();
            var $url = appSettings.apiBaseUri + 'api/FileUpload/RemoveFile/' + requestID;

            $http({
                method: 'POST',
                url: $url,
                data: {}
            }).then(function (response) {
                $defer.resolve(response);
            }).catch(function (err) {
                $defer.reject(err);
            });
            return $defer.promise;
        };

        service.getFileUploadConfigData = function () {

            var $defer = $q.defer(); 

            var $url = appSettings.apiBaseUri + 'api/FileUpload/GetFilesConfig/';

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


        service.getFile = function (id) {          
            var $defer = $q.defer();
            var $url = appSettings.apiBaseUri + 'api/FileUpload/GetFile';

            $http({
                method: 'GET',
                url: $url,
                responseType: 'arraybuffer',                
                headers: {
                    'id': id
                }
            }).success(function (data, status, headers, config) {
                var results = [];
                //setting data, header, status and configs passed from the API to the result set.
                results.data = data;
                results.headers = headers();
                results.status = status;
                results.config = config;
                $defer.resolve(results);
             })
                .error(function (error, status, headers, config) {
                    //converting byte array to JSON object
                    var decodedString = String.fromCharCode.apply(null, new Uint8Array(error));
                    var  errorJsonFormat  =  JSON.parse(decodedString);
                   
                    $defer.reject(errorJsonFormat)
                });
            return $defer.promise;
        };


        service.getDzCallbacks = function (start, complete, success, error) {
           
            return {
                'addedfile': function (file) {
                },
                'queuecomplete': function (progress) {
                },
                'sending': function (progress, xhr, formData) {
                },
                'success': function (file, serverResponse) {
                },
                'error': function (file, errMessage, xhr) {
                }
            };
        };



        function uploadImage($files, movieId, callback) {
            //$files: an array of files selected
            for (var i = 0; i < $files.length; i++) {
                var $file = $files[i];
                (function (index) {
                    $rootScope.upload[index] = $upload.upload({
                        url: "api/movies/images/upload?movieId=" + movieId, // webapi url
                        method: "POST",
                        file: $file
                    }).progress(function (evt) {
                    }).success(function (data, status, headers, config) {
                        // file is uploaded successfully
                        alertService.displaySuccess(data.FileName + ' uploaded successfully');
                        callback();
                    }).error(function (data, status, headers, config) {
                        alertService.displayError(data.Message);
                    });
                })(i);
            }
        };

        return service;
    }

})(angular.module('common.modules'));