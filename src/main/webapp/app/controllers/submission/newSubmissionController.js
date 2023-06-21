vireo.controller('NewSubmissionController', function ($controller, $location, $q, $scope, OrganizationRepo, StudentSubmissionRepo, ManagedConfigurationRepo, SubmissionStates) {

    angular.extend(this, $controller('AbstractController', {
        $scope: $scope
    }));

    $scope.configuration = ManagedConfigurationRepo.getAll();

    $scope.studentSubmissions = StudentSubmissionRepo.getAll();

    $scope.ready = false;
    $scope.creatingSubmission = false;
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
    };

    $scope.findOrganizationById = function (orgId) {
        if ($scope.ready) {
            var found = OrganizationRepo.findOrganizationById(orgId);

            if (!!found) {
                found = {};

                OrganizationRepo.getOrganizationById(orgId, 'tree').then(function (org) {
                    angular.extend(found, new Organization(org));
                }).catch(function(reason) {});
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

        var selected = $scope.findSelectedOrganization();

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
                $scope.creatingSubmission = false;
            });
        } else {
            $scope.creatingSubmission = false;
        }
    };

    $q.all([ManagedConfigurationRepo.ready(), StudentSubmissionRepo.ready()]).then(function () {
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

});
