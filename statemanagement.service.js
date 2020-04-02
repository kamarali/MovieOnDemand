(function (app) {
    'use strict';
    app.factory('stateMgmtService', stateMgmtService);

    function stateMgmtService() {
        var pageParams = [];
        var prevStates = [];
        var state = true;
        var instance_map = {};
        var service = {};

        service.persitantData = [];
        service.dynamicSharedVariable = {};

        service.addPageParams = function (jsonData) {
            pageParams.push(jsonData);
        }
        service.addPrevState = function (jsonData) {
            if (prevStates.length >= 5) {
                prevStates.shift();
            }
            prevStates.push(jsonData);
        }
        service.getPageParams = function () {
            return pageParams.pop();
        }
        service.getPrevStates = function () {
            return prevStates.pop();
        }
        service.removePageParams = function () {
            pageParams = [];
        }
        service.setState = function (d) {
            state = d;
        }
        service.getState = function () {
            return state;
        }

        //Manage Directives inside the dynamic screen
        //===========================================
        service.registerDirective = function(name, ctrl) {
            instance_map[name] = ctrl;
        }

        service.getDirective = function(name) {
            return instance_map[name];
        }

        service.deregisterDirective = function(name) {
            instance_map[name] = null;
        }
        //===========================================

        return service;
    }
})(angular.module('common.modules'));