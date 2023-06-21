vireo.controller('OrganizationSettingsController', function ($controller, $scope, $q, AccordionService, Organization, OrganizationRepo, SidebarService) {

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

    $scope.getOrganizations = function () {
        if ($scope.ready) {
            return OrganizationRepo.organizations;
        }

        return [];
    };

    $scope.loadSelectedOrganization = function (specific) {
        OrganizationRepo.getSelectedOrganization(specific).then(function (org) {
            OrganizationRepo.setSelectedOrganization(org);
        }).catch(function(reason) {
            if (!!reason) console.error(reason);
        });
    };


    $scope.findSelectedOrganization = function () {
        if ($scope.ready) {
            return OrganizationRepo.findSelectedOrganization();
        }

        return {};
        /*if ($scope.ready && !!$scope.selectedOrganization && !!$scope.selectedOrganization.id) {
            return $scope.selectedOrganization;
        }*/
    };

    $scope.setSelectedOrganization = function (organization) {
        if (!organization.loaded) {
            organization = new Organization(organization);
        }

        OrganizationRepo.setSelectedOrganization(organization);

        if (!organization || !organization.id || (!organization.complete && !organization.shallow && !organization.dirty())) {
            $scope.loadSelectedOrganization('shallow');
        }
    };

    $scope.findOrganizationById = function (orgId, select) {
        if ($scope.ready) {
            var found = OrganizationRepo.findOrganizationById(orgId);

            if (!found || !found.id || (!found.complete && !found.shallow)) {
                if (!found) {
                    found = {};
                }

                OrganizationRepo.getOrganizationById(orgId, 'shallow').then(function (org) {
                    angular.extend(found, org);

                    if (!!select) {
                        $scope.setSelectedOrganization(found);
                    }
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
            if (!!OrganizationRepo.findSelectedOrganization() && !!OrganizationRepo.findSelectedOrganization().id) {
                OrganizationRepo.countSubmissions(OrganizationRepo.findSelectedOrganization().id).then(function (res) {
                    $scope.deleteDisabled = res > 0;
                });
            }
        }
    };

    $scope.reloadOrganization = function () {
        OrganizationRepo.getAllTree().then(function (orgs) {
            var selectedId = OrganizationRepo.getSelectedId();

            if (!!orgs && orgs.length > 0) {
                $scope.setSelectedOrganization(orgs[0]);
            }

            if (!!selectedId) {
                var found = $scope.findOrganizationById(selectedId, true);

                if (!found) {
                    $scope.setSelectedOrganization(orgs[0]);
                }
            }
        });
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
