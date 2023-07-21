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
        $scope.recipients = !!OrganizationRepo.selectedOrganization() ? organization.getWorkflowEmailContacts() : [];
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
        if ($scope.ready) {
            return OrganizationRepo.selectedOrganization();
        }
    };

    $scope.setSelectedOrganization = function (organization) {
        if (!organization.loaded) {
            organization = new Organization(organization);
        }

        if (!organization || !organization.id || !organization.complete && !organization.dirty()) {
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

    /**
     * Get the organization from the local cache and if it is not found then query the back-end.
     *
     * When select is true, then the found organization is assigned as the selected organization.
     *
     * If specific is passed, then use the given specific variation when querying the back-end.
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

                OrganizationRepo.getOrganizationById(orgId, specific).then(function (org) {
                    angular.extend(organization, org);

                    if (!!select) {
                        $scope.setSelectedOrganization(organization);
                    }
                }).catch(function(reason) {
                    if (!!reason) console.error(reason);
                });
            } else if (!!select) {
                $scope.setSelectedOrganization(organization);
            }

            return organization;
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

        OrganizationRepo.selectedOrganization().addEmailWorkflowRule(newTemplate.id, recipient, submissionStatus.id).then(function () {
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

        OrganizationRepo.selectedOrganization().editEmailWorkflowRule($scope.emailWorkflowRuleToEdit).then(function () {
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
        OrganizationRepo.selectedOrganization().removeEmailWorkflowRule($scope.emailWorkflowRuleToDelete).then(function () {
            $scope.emailWorkflowRuleDeleteWorking = false;
        });
    };

    $scope.changeEmailWorkflowRuleActivation = function (rule, changeEmailWorkflowRuleActivation) {
        OrganizationRepo.selectedOrganization().changeEmailWorkflowRuleActivation(rule).then(function () {
            changeEmailWorkflowRuleActivation = false;
        });
    };

    $scope.cancelDeleteEmailWorkflowRule = function () {
        $scope.emailWorkflowRuleDeleteWorking = false;
        $scope.closeModal();
    };

    $scope.reloadOrganization = function (specific) {
        OrganizationRepo.getAllTree().then(function (orgs) {
            var selectedId = OrganizationRepo.getSelectedId();

            if (!!orgs && orgs.length > 0) {
                $scope.setSelectedOrganization(orgs[0]);
            }

            if (!!selectedId) {
                var found = $scope.findOrganizationById(selectedId, true, specific);

                if (!found) {
                    $scope.setSelectedOrganization(orgs[0]);
                }
            }
        });
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
