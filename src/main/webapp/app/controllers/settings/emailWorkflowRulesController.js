vireo.controller("EmailWorkflowRulesController", function ($controller, $scope, $q, SubmissionStatusRepo, EmailTemplateRepo, OrganizationRepo, EmailRecipientType) {

    angular.extend(this, $controller("AbstractController", {
        $scope: $scope
    }));

    $scope.submissionStatuses = SubmissionStatusRepo.getAll();
    $scope.emailTemplates = EmailTemplateRepo.getAll();
    $scope.emailRecipientType = EmailRecipientType;
    $scope.organizationRepo = OrganizationRepo;
    $scope.stateRules = {};

    $scope.buildRecipients = function () {
        console.log("DEBUG: building e-mail recipients, org = ", OrganizationRepo.selectedOrganizationId());
        $scope.recipients = !!OrganizationRepo.selectedOrganizationId() ? OrganizationRepo.selectedOrganization().getWorkflowEmailContacts() : [];
    };

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
        if (!organization.loaded) {
            organization = new Organization(organization);
        }

        if (!organization || !organization.id || !organization.complete && !organization.shallow && !organization.dirty()) {
            console.log("DEBUG: email workflow set selected org, getting selected.\n");
            OrganizationRepo.getSelectedOrganization('shallow').then(function (org) {
              console.log("DEBUG: fetched org due to shallow or other =", org);
                OrganizationRepo.setSelectedOrganization(org);
            }).catch(function(reason) {
                if (!!reason) console.error(reason);
            });
        } else {
          console.log("DEBUG: set selected =", organization);
            OrganizationRepo.setSelectedOrganization(organization);
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

        if (!!OrganizationRepo.selectedOrganizationId()) {
            OrganizationRepo.selectedOrganization().addEmailWorkflowRule(newTemplate.id, recipient, submissionStatus.id).then(function () {
                $scope.resetEmailWorkflowRule();
            });
        }

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

        if (!!OrganizationRepo.selectedOrganizationId()) {
            OrganizationRepo.selectedOrganization().editEmailWorkflowRule($scope.emailWorkflowRuleToEdit).then(function () {
                $scope.resetEditEmailWorkflowRule();
            });
        }
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

        if (!!OrganizationRepo.selectedOrganizationId()) {
            OrganizationRepo.selectedOrganization().removeEmailWorkflowRule($scope.emailWorkflowRuleToDelete).then(function () {
                $scope.emailWorkflowRuleDeleteWorking = false;
            });
        }
    };

    $scope.changeEmailWorkflowRuleActivation = function (rule, changeEmailWorkflowRuleActivation) {
        if (!!OrganizationRepo.selectedOrganizationId()) {
            OrganizationRepo.selectedOrganization().changeEmailWorkflowRuleActivation(rule).then(function () {
                changeEmailWorkflowRuleActivation = false;
            });
        }
    };

    $scope.cancelDeleteEmailWorkflowRule = function () {
        $scope.emailWorkflowRuleDeleteWorking = false;
        $scope.closeModal();
    };

    $q.all([SubmissionStatusRepo.ready(), EmailTemplateRepo.ready(), OrganizationRepo.ready()]).then(function () {
        console.log("DEBUG: email workflow rule ready");
        $scope.ready = true;
    });

});
