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
        $scope.updatingOrganization = true;
        organization.save().then(function () {
            // update the parent scoped selected organization
            $scope.setSelectedOrganization(organization);
            $scope.updatingOrganization = false;
        });
    };

    $scope.deleteOrganization = function (organization) {
        organization.delete().then(function (res) {
            var apiRes = angular.fromJson(res.body);
            if (apiRes.meta.status !== 'INVALID') {
                $scope.closeModal();
                $timeout(function () {
                    AlertService.add(apiRes.meta, 'organization/delete');
                }, 300);
            } else {
                $scope.closeModal();
            }
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
        if (!!$scope.selectedOrganization && !!$scope.selectedOrganization.id) {
            $scope.selectedOrganization = {};

            // FIXME: this needs to be updated as it now seems wrong, the orgs 0 needs to be selected, consider $scope.setSelectedOrganization().
            OrganizationRepo.getSelectedOrganization('shallow').then(function (org) {
                org.clearValidationResults();
                org.refresh();
                $scope.selectedOrganization = new Organization(orgs[0]);
            }).catch(function(reason) {
                if (!!reason) console.error(reason);
            });
        }
    };

    $scope.setSelectedOrganization = function (organization) {
        OrganizationRepo.setSelectedOrganization(organization);
        $scope.selectedOrganization = organization;

        if (!organization && !organization.id || (!organization.complete && !organization.shallow)) {
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

        OrganizationRepo.listen(function (args) {
            $scope.resetWorkflowSteps();
        });

        OrganizationRepo.listen(ApiResponseActions.READ, function () {
            $scope.resetManageOrganization();
        });

        OrganizationRepo.listen(ApiResponseActions.BROADCAST, function () {
            $scope.resetManageOrganization();
        });
    });

    $scope.acceptsSubmissions = [{
        "true": "Yes"
    }, {
        "false": "No"
    }];

});
