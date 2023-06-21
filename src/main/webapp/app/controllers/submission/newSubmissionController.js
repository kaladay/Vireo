vireo.controller('NewSubmissionController', function ($controller, $location, $q, $scope, OrganizationRepo, StudentSubmissionRepo, ManagedConfigurationRepo, SubmissionStates) {

    angular.extend(this, $controller('AbstractController', {
        $scope: $scope
    }));

    $scope.organizations = [];

    $scope.configuration = ManagedConfigurationRepo.getAll();

    $scope.studentSubmissions = StudentSubmissionRepo.getAll();

    $scope.ready = false;
    $scope.creatingSubmission = false;

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
                        selectedOrganization = $scope.organizations[i];;
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

    $scope.setSelectedOrganization = function (organization) {
        OrganizationRepo.setSelectedOrganization(organization);

        selectedOrganization = organization;
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
        $scope.creatingSubmission = true;
        StudentSubmissionRepo.create({
            'organizationId': selectedOrganization.id
        }).then(function (response) {
            $scope.creatingSubmission = false;
            var apiRes = angular.fromJson(response.body);
            if (apiRes.meta.status === 'SUCCESS') {
                var submission = apiRes.payload.Submission;
                StudentSubmissionRepo.add(submission);
                $location.path("/submission/" + submission.id);
            }
        });
    };

    $q.all([ManagedConfigurationRepo.ready(), StudentSubmissionRepo.ready()]).then(function () {
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

});
