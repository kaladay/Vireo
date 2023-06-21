vireo.controller("OrganizationManagementController", function ($controller, $location, $q, $route, $scope, $timeout, AccordionService, AlertService, ApiResponseActions, Organization, OrganizationRepo, OrganizationCategoryRepo, WorkflowStepRepo) {

    angular.extend(this, $controller('AbstractController', {
        $scope: $scope
    }));

    $scope.workflowStepRepo = WorkflowStepRepo;

    $scope.organizationCategories = OrganizationCategoryRepo.getAll();

    $scope.selectedOrganization = {};

    $scope.forms = {};

    $scope.ready = false;

    $scope.resetWorkflowSteps = function () {
        OrganizationRepo.clearValidationResults();

        for (var key in $scope.forms) {
            if ($scope.forms[key] !== undefined && !$scope.forms[key].$pristine) {
                $scope.forms[key].$setPristine();
                $scope.forms[key].$setUntouched();
            }
        }
        if ($scope.modalData !== undefined && $scope.modalData.refresh !== undefined) {
            $scope.modalData.refresh();
        }
        $scope.modalData = {
            overrideable: true
        };
        $scope.closeModal();
    };

    $scope.showOrganizationManagement = function () {
        return !!$scope.selectedOrganization && !!$scope.selectedOrganization.id && ($scope.selectedOrganization.id !== 1 || ($scope.selectedOrganization.id == 1 && $scope.isAdmin()));
    };

    $scope.updateOrganization = function (organization) {
        console.log("DEBUG: updating org = ", organization);
        $scope.updatingOrganization = true;
        organization.dirty(true);
        organization.save().then(function (res) {
            console.log("DEBUG: res=", res);
            if (!!res && !!res.body) {
                var apiRes = angular.fromJson(res.body);

                if (apiRes.meta.status === 'SUCCESS') {
                    var keys = Object.keys(apiRes.payload);

                    organization = new Organization(apiRes.payload[keys[0]]);

                    OrganizationRepo.resetOrganization(organization);
                }
            }

            $scope.setSelectedOrganization(organization);
            $scope.updatingOrganization = false;
        }).catch(function(reason) {
            if (!!reason) console.error(reason);

            $scope.updatingOrganization = false;
        });
    };

    $scope.deleteOrganization = function (organization) {
        var parentId = organization.parentOrganization;
        var parent;

        organization.dirty(true);
        organization.delete().then(function (res) {
            var apiRes = angular.fromJson(res.body);
            if (apiRes.meta.status !== 'INVALID') {
                $scope.closeModal();

                if (!!parentId) {
                    parent = OrganizationRepo.findOrganizationById(parentId, true);
                    //parent.dirty(true);
                }

                /*if (!!parentId) {
                    if (!parent) {
                        OrganizationRepo.getOrganizationById(parentId, 'shallow').then(function (org) {
                            org.clearValidationResults();
                            org.refresh();

                            $scope.setSelectedOrganization(org);
                        }).catch(function(reason) {
                            if (!!reason) console.error(reason);
                        });
                    } else {
                        $scope.setSelectedOrganization(parent);
                    }
                }*/

                /*$timeout(function () {
                    AlertService.add(apiRes.meta, 'organization/delete');
                }, 300);*/
            } else {
                $scope.closeModal();
            }
        }).catch(function(reason) {
            if (!!reason) console.error(reason);

            $scope.closeModal();
        });
    };

    $scope.cancelDeleteOrganization = function () {
        $scope.closeModal();

        if (!!$scope.selectedOrganization && !!$scope.selectedOrganization.id) {
            $scope.selectedOrganization.clearValidationResults();
        }
    };

    $scope.restoreOrganizationDefaults = function (organization) {
        OrganizationRepo.restoreDefaults(organization).then(function (data) {
            if (data.meta.status !== 'INVALID') {
                $scope.closeModal();
                $timeout(function () {
                    AlertService.add(data.meta, 'organization/restore-defaults');
                }, 300);
            }
        });
    };

    $scope.cancelRestoreOrganizationDefaults = function () {
        $scope.closeModal();

        if (!!$scope.selectedOrganization && !!$scope.selectedOrganization.id) {
            $scope.selectedOrganization.clearValidationResults();
        }
    };

    $scope.addWorkflowStep = function () {
        var name = $scope.modalData.name;
        OrganizationRepo.addWorkflowStep($scope.modalData);
    };

    $scope.deleteWorkflowStep = function (workflowStep) {
        OrganizationRepo.deleteWorkflowStep(workflowStep).then(function (resObj) {
            if (resObj.meta.status === 'SUCCESS') {
                AccordionService.close(workflowStep.name);
            }
        });
    };

    $scope.updateWorkflowStep = function (workflowStep) {
        OrganizationRepo.setToUpdate(workflowStep.originatingOrganization);
        return OrganizationRepo.updateWorkflowStep(workflowStep);
    };

    $scope.reorderWorkflowStepUp = function (workflowStepID) {
        AccordionService.closeAll();
        return OrganizationRepo.reorderWorkflowSteps("up", workflowStepID);
    };

    $scope.reorderWorkflowStepDown = function (workflowStepID) {
        AccordionService.closeAll();
        return OrganizationRepo.reorderWorkflowSteps("down", workflowStepID);
    };

    $scope.openConfirmDeleteModal = function (step) {
        $scope.openModal('#workflow-step-delete-confirm-' + step.id);
    };

    $scope.resetManageOrganization = function () {
        console.log("DEBUG: resetting manage organization");
        if (!!$scope.selectedOrganization && !!$scope.selectedOrganization.id) {
            $scope.selectedOrganization.dirty(true);

            $scope.setSelectedOrganization($scope.selectedOrganization);

            $scope.selectedOrganization.clearValidationResults();
            $scope.selectedOrganization.refresh();

            console.log("DEBUG: selectedOrganization = ", $scope.selectedOrganization);

            /*OrganizationRepo.getSelectedOrganization('shallow').then(function (org) {
                org = new Organization(org);


            }).catch(function(reason) {
                if (!!reason) console.error(reason);
            });*/
        }
    };

    $scope.setSelectedOrganization = function (organization) {
        if (!organization.loaded) {
            organization = new Organization(organization);
        }

        OrganizationRepo.setSelectedOrganization(organization);
        $scope.selectedOrganization = organization;

        if (!organization || !organization.id || (!organization.complete && !organization.shallow && !organization.dirty())) {
            console.log("DEBUG: (1) reload shallow, organization = ", organization);
            OrganizationRepo.getSelectedOrganization('shallow').then(function (org) {
                angular.extend($scope.selectedOrganization, org);
            }).catch(function(reason) {
                if (!!reason) console.error(reason);
            });
        }
    };

    $q.all([OrganizationCategoryRepo.ready()]).then(function () {
        OrganizationRepo.defer().then(function (orgs) {
            if (!!orgs && orgs.length > 0) {
                $scope.setSelectedOrganization(orgs[0]);
            }

            $scope.resetWorkflowSteps();

            $scope.ready = true;
        }).catch(function(reason) {
            if (!!reason) console.error(reason);
            $scope.ready = true;
        });
    });

    $scope.acceptsSubmissions = [{
        "true": "Yes"
    }, {
        "false": "No"
    }];

});
