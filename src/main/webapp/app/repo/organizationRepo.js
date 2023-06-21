vireo.repo("OrganizationRepo", function OrganizationRepo($q, Organization, RestApi, WsApi) {

    var organizationRepo = this;

    var selectiveListenCallbacks = [];

    var selectedId;

    var firstOrganization = {};

    this.organizations = {};

    this.newOrganization = {};

    var defer;

    this.create = function (organization, parentOrganization) {
        organizationRepo.clearValidationResults();
        angular.extend(this.mapping.create, {
            'method': 'create/' + parentOrganization.id,
            'data': organization
        });
        var promise = WsApi.fetch(this.mapping.create);
        promise.then(function (res) {
            var apiRes = angular.fromJson(res.body);
            if (apiRes.meta.status === "INVALID") {
                angular.extend(organizationRepo, apiRes.payload);
            }
        });
        return promise;
    };

    this.resetNewOrganization = function () {
        for (var key in this.newOrganization) {
            if (key !== 'category' && key !== 'parent') {
                delete this.newOrganization[key];
            }
        }
        return this.newOrganization;
    };

    this.getNewOrganization = function () {
        return this.newOrganization;
    };

    this.findOrganizationById = function (orgId, organizations, specific) {
        if (orgId === undefined) return {};

        console.log("DEBUG: findOrganizationById, =", orgId, organizations, specific);

        if (organizations && organizations.length > 0) {
            for (var i = 0; i < organizations.length; i++) {
                if (organizations[i].id === orgId) {
                    console.log("DEBUG: found orgId=", orgId);
                    if (organizations[i].complete || specific === 'tree') {
                        console.log("DEBUG: is complete or tree=", organizations[i], specific);
                        return organizations[i];
                    }

                    break;
                }
            }
        }

        var found = {};

        organizationRepo.getById(orgId, specific).then(function (org) {
            if (org !== undefined) {
                org.complete = (specific !== 'tree');
                if (organizations) organizations.push(org);
                angular.extend(found, org);

                console.log("DEBUG: missed, loaded orgId=", orgId, found, org, organizations);
            }
        });

        return found;
    };

    this.getSelectedId = function () {
        return selectedId;
    };

    this.setSelectedOrganization = function (organization) {
        selectedId = (organization === undefined) ? undefined : organization.id;
    };

    this.getAllTree = function () {
        return $q(function (resolve, reject) {
            WsApi.fetch(this.mapping.allTree).then(function (res) {
                var apiRes = angular.fromJson(res.body);

                if (apiRes.meta.status === 'SUCCESS') {
                    var keys = Object.keys(apiRes.payload);
                    var regex = /^ArrayList\b/;

                    for (var i = 0; i < keys.length; i++) {
                        if (keys[i].match(regex)) {
                          resolve(apiRes.payload[keys[i]]);
                          return;
                        }
                    }
                }

                reject();
            });
        }.bind(this));
    };


    this.addWorkflowStep = function (workflowStep) {
        organizationRepo.clearValidationResults();
        angular.extend(this.mapping.addWorkflowStep, {
            'method': selectedId + '/create-workflow-step',
            'data': workflowStep
        });
        var promise = WsApi.fetch(this.mapping.addWorkflowStep);
        promise.then(function (res) {
            var resObj = angular.fromJson(res.body);
            if (resObj.meta.status === "INVALID") {
                angular.extend(organizationRepo, resObj.payload);
            }
        });
        return promise;
    };

    this.restoreDefaults = function (organization) {
        angular.extend(this.mapping.restoreDefaults, {
            'data': organization
        });
        var promise = RestApi.post(apiMapping.Organization.restoreDefaults);
        promise.then(function (resObj) {
            if (resObj && resObj.meta.status === "INVALID") {
                angular.extend(organizationRepo, resObj.payload);
            }
        });
        return promise;
    };

    this.updateWorkflowStep = function (workflowStep) {
        organizationRepo.clearValidationResults();
        angular.extend(this.mapping.updateWorkflowStep, {
            'method': selectedId + '/update-workflow-step',
            'data': workflowStep
        });
        var promise = RestApi.post(this.mapping.updateWorkflowStep);
        promise.then(function (resObj) {
            if (resObj.meta.status === "INVALID") {
                angular.extend(organizationRepo, resObj.payload);
            }
        });
        return promise;
    };

    this.deleteWorkflowStep = function (workflowStep) {
        organizationRepo.clearValidationResults();
        angular.extend(this.mapping.deleteWorkflowStep, {
            'method': selectedId + '/delete-workflow-step',
            'data': workflowStep
        });
        var promise = RestApi.post(this.mapping.deleteWorkflowStep);
        promise.then(function (resObj) {
            if (resObj.meta.status === "INVALID") {
                angular.extend(organizationRepo, resObj.payload);
            }
        });
        return promise;
    };

    this.reorderWorkflowSteps = function (upOrDown, workflowStepID) {
        organizationRepo.clearValidationResults();
        angular.extend(this.mapping.reorderWorkflowStep, {
            'method': selectedId + '/shift-workflow-step-' + upOrDown + '/' + workflowStepID
        });
        var promise = WsApi.fetch(this.mapping.reorderWorkflowStep);
        promise.then(function (res) {
            var resObj = angular.fromJson(res.body);
            if (resObj.meta.status === "INVALID") {
                angular.extend(organizationRepo, resObj.payload);
            }
        });
        return promise;
    };

    this.countSubmissions = function (orgId) {
        angular.extend(this.mapping.countSubmissions, {
            'method': orgId + '/count-submissions'
        });
        var defer = $q(function (resolve, reject) {
            WsApi.fetch(this.mapping.countSubmissions).then(function (res) {
                var resObj = angular.fromJson(res.body);
                if (resObj.meta.status === "SUCCESS") {
                    resolve(resObj.payload.Long);
                } else {
                    reject('FAILURE');
                }
            });
        }.bind(this));
        return defer;
    };

    this.getById = function (id, specific) {
        var extra = (specific === 'tree') ? '/tree' : '';
        var endpoint = angular.copy(this.mapping.get);
        endpoint.method = 'get/' + id + extra;

        return $q(function (resolve, reject) {
            WsApi.fetch(endpoint).then(function (res) {
                var apiRes = angular.fromJson(res.body);

                if (apiRes.meta.status === 'SUCCESS') {
                    var keys = Object.keys(apiRes.payload);

                    if (keys.length) {
                        // When specific is defined, then the organization is not complete.
                        apiRes.payload[keys[0]].complete = (extra === '');

                        resolve(apiRes.payload[keys[0]], specific);
                    } else {
                        reject();
                    }
                } else {
                    reject();
                }
            });
        }.bind(this));
    };

    this.findAllTree = function () {
        var organizations = [];

        WsApi.fetch(this.mapping.allTree).then(function (res) {
            var apiRes = angular.fromJson(res.body);

            if (apiRes.meta.status === 'SUCCESS') {
                var keys = Object.keys(apiRes.payload);
                var regex = /^ArrayList\b/;

                for (var i = 0; i < keys.length; i++) {
                    if (keys[i].match(regex)) {
                      var apiList = apiRes.payload[keys[i]];

                      for (var j = 0; j < apiList.length; j++) {
                          // The organization is not complete when using 'tree'.
                          apiList[j].complete = false;

                          organizations.push(apiList[j]);
                      }

                      break;
                    }
                }

                this.ready = true;
            } else {
                reject();
            }
        });;

        return organizations;
    };

    this.reset = function () {
        defer = this.getAllTree();

        return defer.promise;
    };

    this.defer = function () {
        if (defer === undefined) {
            defer = this.getAllTree();
        }

        return defer;
    };

    this.ready = function () {
        return this.defer().promise;
    };

    return this;

});
