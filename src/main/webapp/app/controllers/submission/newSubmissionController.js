vireo.controller('NewSubmissionController', function ($controller, $location, $q, $scope, OrganizationRepo, StudentSubmissionRepo, ManagedConfigurationRepo, SubmissionStates) {

    angular.extend(this, $controller('AbstractController', {
        $scope: $scope
    }));

    $scope.organizations = OrganizationRepo.findAllTree();

    $scope.configuration = ManagedConfigurationRepo.getAll();

    $scope.studentSubmissions = StudentSubmissionRepo.getAll();

    $scope.ready = false;
    $scope.creatingSubmission = false;

    var selectedOrganization = {};

    $scope.getSelectedOrganization = function () {
        return selectedOrganization;
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
        OrganizationRepo.defer().then(function () {
            $scope.setSelectedOrganization(OrganizationRepo.findFirst(true, $scope.organizations));
            $scope.ready = true;
        });
    });

});
