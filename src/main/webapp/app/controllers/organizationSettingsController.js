vireo.controller('OrganizationSettingsController', function ($controller, $scope, $q, AccordionService, OrganizationRepo, SidebarService) {

    angular.extend(this, $controller('AbstractController', {
        $scope: $scope
    }));

    $scope.organizationRepo = OrganizationRepo;

    SidebarService.addBox({
        "title": "Create Organization",
        "viewUrl": "views/sideboxes/organization.html"
    });

    $scope.organizations = OrganizationRepo.findAllTree();

    $scope.activeManagementPane = 'edit';

    $scope.newOrganization = OrganizationRepo.getNewOrganization();

    $scope.selectedOrganization = {};

    $scope.getSelectedOrganization = function () {
        return $scope.selectedOrganization;
    };

    var findOrgMutexLock = false;

    $scope.findOrganizationById = function (orgId) {
        if (findOrgMutexLock) return {};

        findOrgMutexLock = true;
        var found = OrganizationRepo.findOrganizationById(orgId, $scope.organizations);
        findOrgMutexLock = false;
        return found;
    };

    $scope.setSelectedOrganization = function (organization) {
        if ($scope.selectedOrganization && $scope.selectedOrganization.id !== organization.id) {
            AccordionService.closeAll();
        }

        OrganizationRepo.setSelectedOrganization(organization);
        $scope.newOrganization.parent = OrganizationRepo.findSelectedOrganization();

        if (!organization.complete) {
            $scope.selectedOrganization = OrganizationRepo.findSelectedOrganization($scope.organizations);
        } else {
            $scope.selectedOrganization = organization;
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
            var organization = $scope.getSelectedOrganization();

            if (organization && !!organization.id) {
                OrganizationRepo.countSubmissions(organization.id).then(function (res) {
                    $scope.deleteDisabled = res > 0;
                });
            }
        }
    };

    OrganizationRepo.defer().then(function () {
        $scope.setSelectedOrganization(OrganizationRepo.findFirst(true, $scope.organizations));
        $scope.ready = true;
    });

});
