vireo.controller('OrganizationSettingsController', function ($controller, $scope, $q, AccordionService, ControlledVocabularyRepo, FieldProfileRepo, FieldPredicateRepo, Organization, OrganizationRepo, SidebarService) {

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
      console.log("DEBUG: load selected.\n");
        OrganizationRepo.getSelectedOrganization(specific).then(function (org) {
            OrganizationRepo.setSelectedOrganization(org);
            $scope.setDeleteDisabled(org);
        }).catch(function(reason) {
            if (!!reason) console.error(reason);
        });
    };

    /**
     * Get the selected organization.
     *
     * This returns nothing when the scope is not ready.
     */
    $scope.selectedOrganization = function () {
        return OrganizationRepo.selectedOrganization();
    };

    /**
     * Get the selected organization Id.
     *
     * This returns nothing when the scope is not ready.
     */
    $scope.selectedOrganizationId = function () {
        return OrganizationRepo.selectedOrganizationId();
    };

    /**
     * Get the selected organization name.
     *
     * This returns nothing when the scope is not ready.
     */
    $scope.selectedOrganizationName = function () {
        return OrganizationRepo.selectedOrganizationName();
    };

    $scope.setSelectedOrganization = function (organization) {
        if (!organization.loaded) {
            organization = new Organization(organization);
        }

        OrganizationRepo.setSelectedOrganization(organization);

        if (!organization || !organization.id || !organization.complete && !organization.shallow && !organization.dirty()) {
          console.log("DEBUG: (org set) set selected org.\n", organization);
            $scope.loadSelectedOrganization('shallow');
            // @todo need to load individual workflow step data.
        } else {
            $scope.setDeleteDisabled(organization);
        }
    };

    /**
     * Get the organization from the local cache and if it is not found then query the back-end.
     *
     * When select is true, then the found organization is assigned as the selected organization.
     *
     * The returned organization may be asynchronously populated.
     *
     * This returns nothing when the scope is not ready.
     */
    $scope.findOrganizationById = function (orgId, select, specific) {
        if ($scope.ready) {
            var organization = OrganizationRepo.findOrganizationById(orgId);

            if (!organization || !organization.id || !organization.complete && !organization.dirty()) {
                if (!organization) {
                    organization = new Organization({});
                }

console.log("DEBUG: organizationSettings, finding organization by id", orgId);
                OrganizationRepo.getOrganizationById(orgId, specific).then(function (org) {
                    angular.extend(organization, org);

                    if (!!select) {
                        $scope.setSelectedOrganization(organization);
                    }
                }).catch(function(reason) {
                    if (!!reason) console.error(reason);
                });
            }

            return organization;
        }
    };

    $scope.activateManagementPane = function (pane) {
        $scope.activeManagementPane = pane;

        if (!!$scope.selectedOrganizationId) {
            if ($scope.activeManagementPane === 'workflow') {
                if (!$scope.selectedOrganization.complete) {
                    console.log("DEBUG: load organization");
                    $scope.loadSelectedOrganization();
                }
            }
        }
    };

    $scope.managementPaneIsActive = function (pane) {
        return ($scope.activeManagementPane === pane);
    };

    $scope.setDeleteDisabled = function () {
        if ($scope.ready) {
            var existingId = OrganizationRepo.selectedOrganizationId();

            if (!!existingId) {
                OrganizationRepo.countSubmissions(existingId).then(function (res) {
                    $scope.deleteDisabled = res > 0;
                });
            }
        }
    };

    $scope.reloadOrganization = function (specific) {
        OrganizationRepo.getAllTree().then(function (orgs) {
            var selectedId = OrganizationRepo.getSelectedId();

            if (!!orgs && orgs.length > 0) {
                $scope.setSelectedOrganization(orgs[0]);
            }

console.log("DEBUG: organization settings, reloading, finding organization by id", selectedId);
            if (!!selectedId) {
                var found = $scope.findOrganizationById(selectedId, true, specific);

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

        // Pre-load FP data after everything else is loaded and ready.
        console.log("DEBUG: FP ready being called.");
        ControlledVocabularyRepo.getAll();
        FieldProfileRepo.getAll();
        FieldPredicateRepo.getAll();
    }).catch(function(reason) {
        if (!!reason) console.error(reason);
        $scope.ready = true;
    });

});
