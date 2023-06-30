vireo.controller("OrganizationManagementController", function ($controller, $location, $q, $route, $scope, $timeout, AccordionService, AlertService, ApiResponseActions, Organization, OrganizationRepo, OrganizationCategoryRepo, WorkflowStepRepo) {

    angular.extend(this, $controller('AbstractController', {
        $scope: $scope
    }));

    $scope.workflowStepRepo = WorkflowStepRepo;

    $scope.organizationCategories = OrganizationCategoryRepo.getAll();

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
        return !!OrganizationRepo.findSelectedOrganization() && !!OrganizationRepo.findSelectedOrganization().id && (OrganizationRepo.findSelectedOrganization().id !== 1 || (OrganizationRepo.findSelectedOrganization().id == 1 && $scope.isAdmin()));
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
        var parent = this.findOrganizationById(parentId);
        console.log("DEBUG: before delete of ", organization, " parent is ", parent);

        OrganizationRepo.busy(organization.id, true);

        organization.dirty(true);
        organization.delete().then(function (res) {
            var apiRes = angular.fromJson(res.body);
            if (apiRes.meta.status !== 'INVALID') {
                $scope.closeModal();

                if (parent) {
                    console.log("DEBUG: replacing deleted", organization, " with ", parent);
                    OrganizationRepo.setSelectedOrganization(parent);
                }

                /*if (!!parentId) {
                    console.log("DEBUG: after delete, in omc, has parent id.");
                    parent = OrganizationRepo.findOrganizationById(parentId, true);
                    //parent.dirty(true);
                }*/

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

                OrganizationRepo.setDeleted(organization.id);
            } else {
                $scope.closeModal();
            }

            OrganizationRepo.busy(organization.id, false);
        }).catch(function(reason) {
            if (!!reason) console.error(reason);

            $scope.closeModal();
            OrganizationRepo.busy(organization.id, false);
        });
    };

    $scope.cancelDeleteOrganization = function () {
        $scope.closeModal();

        if (!!OrganizationRepo.findSelectedOrganization() && !!OrganizationRepo.findSelectedOrganization().id) {
            OrganizationRepo.findSelectedOrganization().clearValidationResults();
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

        if (!!OrganizationRepo.findSelectedOrganization() && !!OrganizationRepo.findSelectedOrganization().id) {
            OrganizationRepo.findSelectedOrganization().clearValidationResults();
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
        if (!!OrganizationRepo.findSelectedOrganization() && !!OrganizationRepo.findSelectedOrganization().id) {
            OrganizationRepo.findSelectedOrganization().dirty(true);

            $scope.setSelectedOrganization(OrganizationRepo.findSelectedOrganization());

            OrganizationRepo.findSelectedOrganization().clearValidationResults();
            OrganizationRepo.findSelectedOrganization().refresh();

            console.log("DEBUG: selectedOrganization = ", OrganizationRepo.findSelectedOrganization());

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

        if (!organization || !organization.id || (!organization.complete && !organization.shallow && !organization.dirty())) {
            console.log("DEBUG: (1) reload shallow, organization = ", organization);
            OrganizationRepo.getSelectedOrganization('shallow').then(function (org) {
                OrganizationRepo.setSelectedOrganization(org);
            }).catch(function(reason) {
                if (!!reason) console.error(reason);
            });
        } else {
            OrganizationRepo.setSelectedOrganization(organization);
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
