vireo.controller('OrganizationSettingsController', function ($controller, $scope, $q, AccordionService, OrganizationRepo, SidebarService) {

    angular.extend(this, $controller('AbstractController', {
        $scope: $scope
    }));

    $scope.organizationRepo = OrganizationRepo;

    SidebarService.addBox({
        "title": "Create Organization",
        "viewUrl": "views/sideboxes/organization.html"
    });

    $scope.organizations = [];

    $scope.activeManagementPane = 'edit';

    $scope.newOrganization = OrganizationRepo.getNewOrganization();

    var selectedOrganization;

    $scope.getSelectedOrganization = function () {
        if (!!selectedOrganization && selectedOrganization.id) {
            console.log("DEBUG: already loaded, returning: ", $scope.organizations[i]);
            return selectedOrganization;
        }

        if ($scope.ready) {
            var selectedId = OrganizationRepo.getSelectedId();

            if (selectedId !== undefined && $scope.organizations.length > 0) {
                for (var i = 0; i < $scope.organizations.length; i++) {
                    if ($scope.organizations[i].id === selectedId) {
                        console.log("DEBUG: returning: ", $scope.organizations[i]);
                        selectedOrganization = $scope.organizations[i];
                        return $scope.organizations[i];
                    }
                }
            }
        }
    };

    $scope.setSelectedOrganization = function (organization) {
        OrganizationRepo.setSelectedOrganization(organization);

        selectedOrganization = organization;
    };

    $scope.findOrganizationById = function (orgId) {
        return OrganizationRepo.findOrganizationById(orgId, $scope.organizations, 'tree');
    };

    $scope.activateManagementPane = function (pane) {
        $scope.activeManagementPane = pane;
    };

    $scope.managementPaneIsActive = function (pane) {
        return ($scope.activeManagementPane === pane);
    };

    $scope.setDeleteDisabled = function () {
        if ($scope.ready) {
            var organization = $scope.getSelectedOrganization();

            if (organization && !!organization.id) {
                OrganizationRepo.countSubmissions(organization.id).then(function (res) {
                    $scope.deleteDisabled = res > 0;
                });
            }
        }
    };

    OrganizationRepo.defer().then(function (orgs) {
        if (!!orgs && orgs.length > 0) {
            OrganizationRepo.setSelectedOrganization(orgs[0]);

            for (var i = 0; i < orgs.length; i++) {
                $scope.organizations.push(orgs[i]);
            }
        }

        $scope.ready = true;
    });

});
