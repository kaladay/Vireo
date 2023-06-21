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

    $scope.findSelectedOrganization = function () {
        if ($scope.ready) {
            return $scope.selectedOrganization;
        }
    };

    $scope.setSelectedOrganization = function (organization) {
        OrganizationRepo.setSelectedOrganization(organization);
        $scope.selectedOrganization = organization;

        /* TODO: may need to fetch the non-tree here to get the full organization because more than 'tree' is needed here.
        OrganizationRepo.getSelectedOrganization('tree').then(function (org) {
            angular.extend($scope.selectedOrganization, new Organization(org));
        }).catch(function(reason) {});
        */
    };

    $scope.findOrganizationById = function (orgId) {
        if ($scope.ready) {
            var found = OrganizationRepo.findOrganizationById(orgId);
            console.log("DEBUG: (admin sett) findOrganizationById(", orgId, ") returned: ", found);

            if (!!found) {
                found = {};

                OrganizationRepo.getOrganizationById(orgId).then(function (org) {
                    angular.extend(found, org);
                }).catch(function(reason) {});
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
            OrganizationRepo.setSelectedOrganization(orgs[0]);

            $scope.selectedOrganization = orgs[0];
        }

        $scope.ready = true;
    }).catch(function(reason) {
        $scope.ready = true;
    });

});
