vireo.controller("OrganizationSideBarController", function ($controller, $scope, $q, OrganizationCategoryRepo, OrganizationRepo) {

    angular.extend(this, $controller('AbstractController', {
        $scope: $scope
    }));

    var organizationCategories = OrganizationCategoryRepo.getAll();

    $scope.ready = false;
    $scope.forms = {};
    $scope.topOrganization = {};
    $scope.newOrganization = {};
    $scope.organizationRepo = OrganizationRepo;

    $scope.reset = function () {
        OrganizationRepo.clearValidationResults();

        for (var key in $scope.forms) {
            if ($scope.forms[key] !== undefined && !$scope.forms[key].$pristine) {
                $scope.forms[key].$setPristine();
                $scope.forms[key].$setUntouched();
            }
        }

        $scope.newOrganization = OrganizationRepo.resetNewOrganization();

        if ($scope.newOrganization.category === undefined) {
            $scope.newOrganization.category = $scope.organizationCategories[0];
        }

        if ($scope.newOrganization.parent === undefined) {
            $scope.newOrganization.parent = $scope.topOrganization;
        }
    };

    $scope.createNewOrganization = function (hierarchical) {
        $scope.creatingNewOrganization = true;
        var parentOrganization = hierarchical === 'true' ? OrganizationRepo.newOrganization.parent : $scope.topOrganization;
        OrganizationRepo.create({
            "name": OrganizationRepo.newOrganization.name,
            "category": OrganizationRepo.newOrganization.category,
            "parentOrganization": {
                "id": parentOrganization.id,
                "name": parentOrganization.name,
                "category": parentOrganization.category
            }
        }, parentOrganization).then(function () {
            $scope.creatingNewOrganization = false;
            $scope.reset();
        });
    };

    $q.all([OrganizationCategoryRepo.ready()]).then(function () {
        OrganizationRepo.defer().then(function (orgs) {
            if (!!orgs && orgs.length > 0) {
                $scope.topOrganization = orgs[0];
            }

            $scope.reset();

            $scope.ready = true;
        }).catch(function(reason) {
            if (!!reason) console.error(reason);
            $scope.ready = true;
        });

        $scope.organizationCategories = organizationCategories.filter(function (category) {
            return category.name !== 'System';
        });

    });

});
