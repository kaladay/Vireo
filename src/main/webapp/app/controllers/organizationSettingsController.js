vireo.controller('OrganizationSettingsController', function ($controller, $scope, $q, AccordionService, OrganizationRepo, SidebarService) {

    angular.extend(this, $controller('AbstractController', {
        $scope: $scope
    }));

    $scope.organizationRepo = OrganizationRepo;

    SidebarService.addBox({
        "title": "Create Organization",
        "viewUrl": "views/sideboxes/organization.html"
    });

    $scope.activeManagementPane = 'edit';

    $scope.newOrganization = OrganizationRepo.getNewOrganization();
    $scope.selectedOrganization = {};

    $scope.getOrganizations = function () {
        if ($scope.ready) {
            return OrganizationRepo.organizations;
        }

        return [];
    };

    $scope.loadSelectedOrganization = function (specific) {
        OrganizationRepo.getSelectedOrganization(specific).then(function (org) {
            console.log("DEBUG: extending = ", org);
            if (!$scope.selectedOrganization) {
                $scope.selectedOrganization = org;
            } else {
                angular.extend($scope.selectedOrganization, org);
            }
        }).catch(function(reason) {
            if (!!reason) console.error(reason);
        });
    };

    $scope.findSelectedOrganization = function () {
        if ($scope.ready && !!$scope.selectedOrganization && !!$scope.selectedOrganization.id) {
            return $scope.selectedOrganization;
        }
    };

    $scope.setSelectedOrganization = function (organization) {
        console.log("DEBUG: setting selected org=", organization);
        OrganizationRepo.setSelectedOrganization(organization);
        $scope.selectedOrganization = organization;

        if (!organization && !organization.id || (!organization.complete && !organization.shallow)) {
            $scope.loadSelectedOrganization('shallow');
        }
    };

    $scope.findOrganizationById = function (orgId) {
        if ($scope.ready) {
            var found = OrganizationRepo.findOrganizationById(orgId);
            console.log("DEBUG: (admin sett) findOrganizationById(", orgId, ") returned: ", found);

            if (!found && !found.id || (!found.complete && !found.shallow)) {
                if (!found) {
                    found = {};
                }

                OrganizationRepo.getOrganizationById(orgId, 'shallow').then(function (org) {
                    console.log("DEBUG: extending = ", found, org);
                    angular.extend(found, org);
                }).catch(function(reason) {
                    if (!!reason) console.error(reason);
                });
            }

            return found;
        }
    };

    $scope.activateManagementPane = function (pane) {
        $scope.activeManagementPane = pane;
    };

    $scope.managementPaneIsActive = function (pane) {
        return ($scope.activeManagementPane === pane);
    };

    $scope.setDeleteDisabled = function () {
        if ($scope.ready) {
            if (!!$scope.selectedOrganization && !!$scope.selectedOrganization.id) {
                OrganizationRepo.countSubmissions($scope.selectedOrganization.id).then(function (res) {
                    $scope.deleteDisabled = res > 0;
                });
            }
        }
    };

    OrganizationRepo.defer().then(function (orgs) {
        if (!!orgs && orgs.length > 0) {
            $scope.setSelectedOrganization(orgs[0]);
        }

        $scope.ready = true;
    }).catch(function(reason) {
        if (!!reason) console.error(reason);
        $scope.ready = true;
    });

});
