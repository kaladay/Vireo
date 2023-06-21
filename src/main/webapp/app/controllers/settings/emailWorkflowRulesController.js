vireo.controller("EmailWorkflowRulesController", function ($controller, $scope, $q, SubmissionStatusRepo, EmailTemplateRepo, OrganizationRepo, EmailRecipientType) {

    angular.extend(this, $controller("AbstractController", {
        $scope: $scope
    }));

    $scope.submissionStatuses = SubmissionStatusRepo.getAll();
    $scope.emailTemplates = EmailTemplateRepo.getAll();
    $scope.emailRecipientType = EmailRecipientType;
    $scope.organizationRepo = OrganizationRepo;
    $scope.stateRules = {};
    $scope.selectedOrganization = {};

    $scope.buildRecipients = function () {
        $scope.recipients = !!$scope.selectedOrganization ? organization.getWorkflowEmailContacts() : [];
    };

    $scope.getOrganizations = function () {
        if ($scope.ready) {
            return OrganizationRepo.organizations;
        }

        return [];
    };

    $scope.findSelectedOrganization = function () {
        if ($scope.ready && !!$scope.selectedOrganization && !!$scope.selectedOrganization.id) {
            return $scope.selectedOrganization;
        }
    };

    $scope.setSelectedOrganization = function (organization) {
        OrganizationRepo.setSelectedOrganization(organization);
        $scope.selectedOrganization = organization;

        if (!organization && !organization.id || (!organization.complete && !organization.shallow)) {
            OrganizationRepo.getSelectedOrganization('shallow').then(function (org) {
                angular.extend($scope.selectedOrganization, org);
            }).catch(function(reason) {
                if (!!reason) console.error(reason);
            });
        }
    };

    $scope.findOrganizationById = function (orgId) {
        if ($scope.ready) {
            var found = OrganizationRepo.findOrganizationById(orgId);
            console.log("DEBUG: (admin sett) findOrganizationById(", orgId, ") returned: ", found);

            if (!found && !found.id || (!found.complete && !found.shallow)) {
                if (!found) {
                    found = {};
                }

                OrganizationRepo.getOrganizationById(orgId, 'shallow').then(function (org) {
                    console.log("DEBUG: extending = ", found, org);
                    angular.extend(found, org);
                }).catch(function(reason) {
                    if (!!reason) console.error(reason);
                });
            }

            return found;
        }
    };

    $scope.openAddEmailWorkflowRuleModal = function (id) {
        $scope.buildRecipients();

        $scope.newTemplate = $scope.emailTemplates[0];
        $scope.newRecipient = $scope.recipients[0];

        $scope.openModal(id);

    };

    $scope.resetEmailWorkflowRule = function () {
        $scope.newTemplate = $scope.emailTemplates[0];
        $scope.newRecipient = $scope.recipients[0].data;
        $scope.closeModal();
    };

    $scope.addEmailWorkflowRule = function (newTemplate, newRecipient, submissionStatus) {
        var recipient = angular.copy(newRecipient);

        if (recipient.type === EmailRecipientType.ORGANIZATION) {
            recipient.data = recipient.data.id;
        }

        $scope.selectedOrganization.addEmailWorkflowRule(newTemplate.id, recipient, submissionStatus.id).then(function () {
            $scope.resetEmailWorkflowRule();
        });

    };

    $scope.openEditEmailWorkflowRule = function (rule) {
        $scope.buildRecipients();
        $scope.emailWorkflowRuleToEdit = angular.copy(rule);
        for (var i in $scope.recipients) {
            var recipient = $scope.recipients[i];
            if (recipient.name == $scope.emailWorkflowRuleToEdit.emailRecipient.name) {
                $scope.emailWorkflowRuleToEdit.emailRecipient = recipient;
                break;
            }
        }

        for (var j in $scope.emailTemplates) {
            var template = $scope.emailTemplates[j];
            if (template.id == $scope.emailWorkflowRuleToEdit.emailTemplate.id) {
                $scope.emailWorkflowRuleToEdit.emailTemplate = template;
                break;
            }
        }

        $scope.openModal("#editEmailWorkflowRule");
    };

    $scope.editEmailWorkflowRule = function () {

        if ($scope.emailWorkflowRuleToEdit.emailRecipient.type == EmailRecipientType.ORGANIZATION) $scope.emailWorkflowRuleToEdit.emailRecipient.data = $scope.emailWorkflowRuleToEdit.emailRecipient.data.id;

        $scope.selectedOrganization.editEmailWorkflowRule($scope.emailWorkflowRuleToEdit).then(function () {
            $scope.resetEditEmailWorkflowRule();
        });
    };

    $scope.resetEditEmailWorkflowRule = function () {
        $scope.closeModal();
    };

    $scope.confirmEmailWorkflowRuleDelete = function (rule) {
        $scope.emailWorkflowRuleToDelete = rule;
        $scope.openModal("#confirmEmailWorkflowRuleDelete");
    };

    $scope.deleteEmailWorkflowRule = function () {
        $scope.emailWorkflowRuleDeleteWorking = true;
        $scope.selectedOrganization.removeEmailWorkflowRule($scope.emailWorkflowRuleToDelete).then(function () {
            $scope.emailWorkflowRuleDeleteWorking = false;
        });
    };

    $scope.changeEmailWorkflowRuleActivation = function (rule, changeEmailWorkflowRuleActivation) {
        $scope.selectedOrganization.changeEmailWorkflowRuleActivation(rule).then(function () {
            changeEmailWorkflowRuleActivation = false;
        });
    };

    $scope.cancelDeleteEmailWorkflowRule = function () {
        $scope.emailWorkflowRuleDeleteWorking = false;
        $scope.closeModal();
    };

    $q.all([SubmissionStatusRepo.ready(), EmailTemplateRepo.ready()]).then(function () {
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
