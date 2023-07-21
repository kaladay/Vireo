vireo.controller('NewSubmissionController', function ($controller, $location, $q, $scope, OrganizationRepo, StudentSubmissionRepo, ManagedConfigurationRepo, SubmissionStates) {

    angular.extend(this, $controller('AbstractController', {
        $scope: $scope
    }));

    $scope.configuration = ManagedConfigurationRepo.getAll();

    $scope.studentSubmissions = StudentSubmissionRepo.getAll();

    $scope.ready = false;
    $scope.creatingSubmission = false;

    $scope.getOrganizations = function () {
        if ($scope.ready) {
            return OrganizationRepo.organizations;
        }

        return [];
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
        OrganizationRepo.setSelectedOrganization(organization);
    };

    /**
     * Get the organization from the local cache and if it is not found then query the back-end.
     *
     * When select is true, then the found organization is assigned as the selected organization.
     *
     * The 'tree' is always passed when querying the back-end.
     *
     * The returned organization may be asynchronously populated.
     *
     * This returns nothing when the scope is not ready.
     */
    $scope.findOrganizationById = function (orgId, select) {
        if ($scope.ready) {
            var organization = OrganizationRepo.findOrganizationById(orgId);

            if (!organization || !organization.id) {
                if (!organization) {
                    organization = new Organization({});
                }

console.log("DEBUG: new submission, finding organization by id", orgId);
                OrganizationRepo.getOrganizationById(orgId, 'tree').then(function (org) {
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

    $scope.hasSubmission = function (organization) {
        if (organization === undefined) return false;

        var hasSubmission = false;

        for (var i in $scope.studentSubmissions) {
            var submission = $scope.studentSubmissions[i];
            if (submission.organization.id === organization.id) {
                hasSubmission = true;
                break;
            }
        }

        return hasSubmission;
    };

    $scope.gotoSubmission = function (organization) {
      if (organization === undefined) return;
        for (var i in $scope.studentSubmissions) {
            var submission = $scope.studentSubmissions[i];
            if (submission.organization.id === organization.id) {
                if (submission.submissionStatus.submissionState === SubmissionStates.IN_PROGRESS) {
                    $location.path("/submission/" + submission.id);
                } else {
                    $location.path("/submission/" + submission.id + "/view");
                }
            }
        }
    };

    $scope.createSubmission = function () {
        if ($scope.creatingSubmission) {
            return;
        }

        $scope.creatingSubmission = true;

        var selected = OrganizationRepo.selectedOrganization();

        if (!!selected && !!selected.id) {
            StudentSubmissionRepo.create({
                'organizationId': selected.id
            }).then(function (response) {
                var apiRes = angular.fromJson(response.body);

                if (apiRes.meta.status === 'SUCCESS') {
                    var submission = apiRes.payload.Submission;
                    StudentSubmissionRepo.add(submission);
                    $location.path("/submission/" + submission.id);
                }

                $scope.creatingSubmission = false;
            }).catch(function(reason) {
                if (!!reason) console.error(reason);
                $scope.creatingSubmission = false;
            });
        } else {
            $scope.creatingSubmission = false;
        }
    };

    $scope.reloadOrganization = function () {
        OrganizationRepo.getAllTree().then(function (orgs) {
            var selectedId = OrganizationRepo.getSelectedId();

            if (!!orgs && orgs.length > 0) {
                $scope.setSelectedOrganization(orgs[0]);
            }

console.log("DEBUG: new submission, reloading, finding organization by id", selectedId);
            if (!!selectedId) {
                var found = $scope.findOrganizationById(selectedId, true);

                if (!found) {
                    $scope.setSelectedOrganization(orgs[0]);
                }
            }
        });
    };

    $q.all([ManagedConfigurationRepo.ready(), StudentSubmissionRepo.ready()]).then(function () {
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

});
