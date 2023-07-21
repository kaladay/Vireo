vireo.controller("OrganizationManagementController", function ($controller, $location, $q, $route, $scope, $timeout, AccordionService, AlertService, ApiResponseActions, Organization, OrganizationRepo, OrganizationCategoryRepo, WorkflowStepRepo) {

    angular.extend(this, $controller('AbstractController', {
        $scope: $scope
    }));

    $scope.workflowStepRepo = WorkflowStepRepo;

    $scope.organizationCategories = OrganizationCategoryRepo.getAll();

    $scope.forms = {};

    $scope.ready = false;

    $scope.deleting = false;

    $scope.setting = false;

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
        var existingId = OrganizationRepo.selectedOrganizationId();
        return !!existingId && (existingId !== 1 || (existingId == 1 && $scope.isAdmin()));
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
        $scope.deleting = true;
        OrganizationRepo.busy(organization.id, true);

        var parentId = organization.parentOrganization;
        var parent = this.findOrganizationById(parentId, false, 'shallow');
        console.log("DEBUG: before delete of ", organization, " parent is ", parent);

        organization.dirty(true);
        organization.delete().then(function (res) {
            var apiRes = angular.fromJson(res.body);
            if (apiRes.meta.status === 'SUCCESS') {
                OrganizationRepo.setDeleted(organization.id);
                $scope.closeModal();

                console.log("DEBUG: replacing deleted", organization, " with ", parent);
                OrganizationRepo.setSelectedOrganization(parent);

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
            } else {
                $scope.closeModal();
            }

            OrganizationRepo.busy(organization.id, false);
            $scope.deleting = false;
        }).catch(function(reason) {
            if (!!reason) console.error(reason);

            $scope.closeModal();
            OrganizationRepo.busy(organization.id, false);
            $scope.deleting = false;
        });
    };

    $scope.cancelDeleteOrganization = function () {
        $scope.closeModal();

        if (OrganizationRepo.selectedOrganizationId()) {
            OrganizationRepo.selectedOrganization().clearValidationResults();
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

        if (!!OrganizationRepo.selectedOrganizationId()) {
            OrganizationRepo.selectedOrganization().clearValidationResults();
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
        var workflowStepToUpdate = new workflowStep(workflowStep);
        console.log("DEBUG: updating workflowStep=", workflowStep, ", workflowStepToUpdate =", workflowStepToUpdate);
        OrganizationRepo.setToUpdate(workflowStep.originatingOrganization);
        return OrganizationRepo.updateWorkflowStep(workflowStepToUpdate);
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
        console.log("DEBUG: resetting manage organization, deleting =", $scope.deleting, ", selected=", OrganizationRepo.selectedOrganization());
        if (!!OrganizationRepo.selectedOrganizationId()) {
            OrganizationRepo.selectedOrganization().dirty(true);

            $scope.setSelectedOrganization(OrganizationRepo.selectedOrganization());

            OrganizationRepo.selectedOrganization().clearValidationResults();
            OrganizationRepo.selectedOrganization().refresh();

            console.log("DEBUG: (resetManageOrganization) selectedOrganization = ", OrganizationRepo.selectedOrganization());

            /*OrganizationRepo.getSelectedOrganization('shallow').then(function (org) {
                org = new Organization(org);


            }).catch(function(reason) {
                if (!!reason) console.error(reason);
            });*/
        }
    };

    $scope.setSelectedOrganization = function (organization, specific) {
      // @todo the scope.setting may need to always store the last selected id, perhaps then wait until setting is complete and the trigger the setting again after the timeout resolves.
        if ($scope.ready && !$scope.setting) {
            $scope.setting = true;

            if (!organization.loaded) {
                organization = new Organization(organization);
            }

// @todo each of these needs a busy check.
            if (!organization || !organization.id || !organization.complete &&  !organization.shallow && !organization.dirty()) {
                console.log("DEBUG: (1) (org man) set selected, reload shallow, organization = ", organization, ", deleting =", $scope.deleting, ", selected=", OrganizationRepo.selectedOrganization());
                OrganizationRepo.getSelectedOrganization('shallow').then(function (org) {
                    OrganizationRepo.setSelectedOrganization(org);
                    $scope.setting = false;
                }).catch(function(reason) {
                    if (!!reason) console.error(reason);
                });
            } else {
                console.log("DEBUG: (2) (org man) set selected, organization = ", organization, ", deleting =", $scope.deleting, ", selected=", OrganizationRepo.selectedOrganization());
                OrganizationRepo.setSelectedOrganization(organization);

                $timeout(function () { // FIXME: added experimentally to debug how multi-simultaneous assignments are happening.
                    $scope.setting = false;
                }, 50);
            }
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
