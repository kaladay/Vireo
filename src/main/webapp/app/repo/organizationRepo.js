vireo.repo("OrganizationRepo", function OrganizationRepo($q, Organization, RestApi, WsApi) {

    var organizationRepo = this;

    var selectiveListenCallbacks = [];

    var selectedId;

    var defer;

    var busy = {};

    var ready = false;

    var loadByIdMutexLock = {};

    var deleted = {};

    var selectedOrganization;

    organizationRepo.organizations = [];

    organizationRepo.newOrganization = {};

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

    /**
     * Perform the actual request to the back-end to get the organization by the given ID.
     *
     * If specific is passed, then use the given specific variation when querying the back-end.
     *
     * This returns a promise.
     */
    this.getById = function (id, specific) {
        var extra = '';
        var endpoint = angular.copy(this.mapping.get);

        if (specific === 'shallow') {
            extra = '/shallow';
        } else if (specific === 'tree') {
            extra = '/tree';
        }

        endpoint.method = 'get/' + id + extra;

        return $q(function (resolve, reject) {
            WsApi.fetch(endpoint).then(function (res) {
                var apiRes = angular.fromJson(res.body);

                if (apiRes.meta.status === 'SUCCESS') {
                    var keys = Object.keys(apiRes.payload);

                    if (specific === 'shallow') {
                        apiRes.payload[keys[0]].shallow = true;
                    } else if (specific === 'tree') {
                        apiRes.payload[keys[0]].tree = true;
                    }

                    if (keys.length) {
                        resolve(apiRes.payload[keys[0]], specific);
                    } else {
                        reject(apiRes.meta);
                    }
                } else {
                    reject(apiRes.meta);
                }
            });
        }.bind(this));
    };


    /**
     * Get an organization by the given ID, querying from the database if necessary.
     *
     * If specific is passed, then use the given specific variation when querying the back-end.
     *
     * This returns a promise.
     */
    this.getOrganizationById = function (orgId, specific) {
        if (orgId === undefined || !ready || !!loadByIdMutexLock[orgId]) {
            if (!!loadByIdMutexLock[orgId]) {
                console.log("DEBUG: mutex is locked on ", orgId, specific);
            }

            return $q(function (resolve, reject) {
                reject(false);
            });
        }

        loadByIdMutexLock[orgId] = true;

        console.log("DEBUG: getOrganizationById, =", orgId, organizationRepo.organizations, specific);

        return $q(function (resolve, reject) {
            organizationRepo.getById(orgId, specific).then(function (org) {
                if (org !== undefined) {
                    org = new Organization(org);

                    for (var i = 0; i < organizationRepo.organizations.length; i++) {
                        if (organizationRepo.organizations[i].id === orgId) {
                            if (!organizationRepo.organizations[i].complete || !!org.complete) {
                                if (!!org.complete) {
                                    org.shallow = false;
                                    org.tree = false;
                                } else if (!!organizationRepo.organizations[i].tree && !!org.shadow) {
                                    org.tree = false;
                                }

                                organizationRepo.organizations[i] = org;
                            } else {
                                i = organizationRepo.organizations.length;
                            }

                            break;
                        }
                    }

                    if (i == organizationRepo.organizations.length) {
                        organizationRepo.organizations.push(org);
                    }

                    if (!!selectedOrganization && !!selectedOrganization.id && selectedOrganization.id == org.id) {
                        selectedOrganization = org;
                    }

                    resolve(org);
                } else {
                    reject("Received organization is undefined.");
                }

                console.log("DEBUG: deleting/releasing mutex lock on", orgId, specific);

                delete loadByIdMutexLock[orgId];
            }).catch(function(reason) {
              reject(reason);

              console.log("DEBUG: (failure) deleting/releasing mutex lock on", orgId, specific);
              delete loadByIdMutexLock[orgId];
            });
        }.bind(this));
    };

    /**
     * Find the organization via the local cache.
     *
     * This checks to see if the organization has been deleted (and therefore added to the deleted cache).
     *
     * False is returns when the organization has been deleted.
     *
     * Othewise, the organization is returned or if the organization is no found, then nothing is returned.
     */
    this.findOrganizationById = function (orgId) {
        if (!!deleted[orgId]) {
            console.log("DEBUG: org", orgId, " is deleted.");
            return false;
        }

        for (var i = 0; i < organizationRepo.organizations.length; i++) {
            if (organizationRepo.organizations[i].id === orgId && !organizationRepo.organizations[i].dirty()) {
                return organizationRepo.organizations[i];
            }
        }
    }

    /**
     * Return the selected organization from the local cache without querying the back-end.
     *
     * If the organization is not found, then do not return anything.
     */
    this.selectedOrganization = function () {
        return selectedOrganization;
    };

    /**
     * Get the selected organization, querying from the database if necessary.
     *
     * If specific is passed, then use the given specific variation when querying the back-end.
     *
     * This returns a promise.
     */
    this.getSelectedOrganization = function (specific) {
        return this.getOrganizationById(selectedId, specific);
    };

    /**
     * Get the ID of the selected organization from the local cache without querying the back-end.
     */
    this.getSelectedId = function () {
        return selectedId;
    };

    /**
     * Update the local cache to designate that the given organization is selected.
     */
    this.setSelectedOrganization = function (organization) {
        if (!organization || !organization.id) {
            return;
        }

        busy[organization.id] = true;

        selectedId = organization.id;

        if (!organization.loaded) {
            organization = new Organization(organization);
        }

        selectedOrganization = organization;
        this.newOrganization.parent = organization;

        busy[organization.id] = false;
    };

    /**
     * Reset the local caches for the given organization, replacing the cache with the given organization.
     */
    this.resetOrganization = function (organization) {
        if (!organization.loaded) {
            organization = new Organization(organization);
        }

        if (!!selectedOrganization && !!selectedOrganization.id && selectedOrganization.id == organization.id) {
            selectedOrganization = organization;
        }

        for (var i = 0; i < organizationRepo.organizations.length; i++) {
            if (organizationRepo.organizations[i].id === organization.id) {
                organizationRepo.organizations[i] = organization;

                return;
            }
        }
    };

    /**
     * Get the organization tree, using "tree" as the specific fetch type.
     *
     * This returns a promise.
     */
    this.getAllTree = function (selectCallback) {
        return $q(function (resolve, reject) {
            var oldId = selectedId;

            WsApi.fetch(this.mapping.allTree).then(function (res) {
                var apiRes = angular.fromJson(res.body);

                if (apiRes.meta.status === 'SUCCESS') {
                    var keys = Object.keys(apiRes.payload);
                    var regex = /^ArrayList\b/;

                    for (var i = 0; i < keys.length; i++) {
                        if (keys[i].match(regex)) {
                            var apiList = apiRes.payload[keys[i]];

                            organizationRepo.organizations.length = 0;

                            for (var j = 0; j < apiList.length; j++) {
                                organizationRepo.organizations.push(new Organization(apiList[j]));

                                if (!!selectCallback && organizationRepo.organizations[j].id == oldId) {
                                    selectCallback(organizationRepo.organizations[j]);
                                }
                            }

                          resolve(organizationRepo.organizations);
                        }
                    }
                }
                else {
                  reject(apiRes.meta);
                }

                ready = true;
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

    this.reset = function () {
        ready = false;
        defer = this.getAllTree();

        return defer.promise;
    };

    this.defer = function () {
        if (defer === undefined) {
            defer = this.getAllTree();
        }

        return defer;
    };

    this.setDeleted = function (orgId) {
        for (var i = 0; i < organizationRepo.organizations.length; i++) {
            if (organizationRepo.organizations[i].id === orgId && !organizationRepo.organizations[i].dirty()) {
                delete organizationRepo.organizations[i];

                break;
            }
        }

        deleted[orgId] = true;
    };

    this.busy = function (orgId, newValue) {
        if (orgId === undefined) {
            return !!selectedOrganization && !!busy[selectedOrganization.id] ? busy[selectedOrganization.id] : false;
        }

        if (newValue === undefined) {
            return !!busy[orgId] ? busy[orgId] : false;
        }

        busy[orgId] = newValue === true;

        return newValue;
    };

    this.ready = function () {
        return this.defer().promise;
    };

    return this;

});
