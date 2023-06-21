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
        OrganizationRepo.setSelectedOrganization(organization);
    };

    $scope.findOrganizationById = function (orgId, select) {
        if ($scope.ready) {
            var found = OrganizationRepo.findOrganizationById(orgId);

            if (!found || !found.id) {
                found = {};

                OrganizationRepo.getOrganizationById(orgId, 'tree').then(function (org) {
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

        var selected = OrganizationRepo.findSelectedOrganization();

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
