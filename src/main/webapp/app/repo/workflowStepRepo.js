vireo.repo("WorkflowStepRepo", function WorkfloStepRepo(OrganizationRepo, RestApi, WsApi) {

    var workflowStepRepo = this;

    // additional repo methods and variables

    this.addFieldProfile = function (workflowStep, fieldProfile) {
        workflowStepRepo.clearValidationResults();
        OrganizationRepo.setToUpdate(workflowStep.originatingOrganization);
        fieldProfile.originatingWorkflowStep = workflowStep.id;
        angular.extend(this.mapping.addFieldProfile, {
            'method': OrganizationRepo.findSelectedOrganization('tree').id + '/' + workflowStep.id + '/add-field-profile',
            'data': fieldProfile
        });
        var promise = RestApi.post(this.mapping.addFieldProfile);
        promise.then(function (res) {
            if (res.meta.status === "INVALID") {
                angular.extend(workflowStepRepo, res.payload);
            }
        });
        return promise;
    };

    this.updateFieldProfile = function (workflowStep, fieldProfile) {
        workflowStepRepo.clearValidationResults();
        OrganizationRepo.setToUpdate(workflowStep.originatingOrganization);
        fieldProfile.originatingWorkflowStep = workflowStep.id;
        angular.extend(this.mapping.updateFieldProfile, {
            'method': OrganizationRepo.findSelectedOrganization().id + '/' + workflowStep.id + '/update-field-profile',
            'data': fieldProfile
        });
        var promise = RestApi.post(this.mapping.updateFieldProfile);
        promise.then(function (res) {
            if (res.meta.status === "INVALID") {
                angular.extend(workflowStepRepo, res.payload);
            }
        });
        return promise;
    };

    this.removeFieldProfile = function (workflowStep, fieldProfile) {
        workflowStepRepo.clearValidationResults();
        OrganizationRepo.setToUpdate(workflowStep.originatingOrganization);
        angular.extend(this.mapping.removeFieldProfile, {
            'method': OrganizationRepo.findSelectedOrganization().id + '/' + workflowStep.id + '/remove-field-profile',
            'data': fieldProfile
        });
        var promise = WsApi.fetch(this.mapping.removeFieldProfile);
        promise.then(function (res) {
            if (angular.fromJson(res.body).meta.status === "INVALID") {
                angular.extend(workflowStepRepo, angular.fromJson(res.body).payload);
            }
        });
        return promise;
    };

    this.reorderFieldProfiles = function (workflowStep, src, dest) {
        workflowStepRepo.clearValidationResults();
        OrganizationRepo.setToUpdate(workflowStep.originatingOrganization);
        angular.extend(this.mapping.reorderFieldProfile, {
            'method': OrganizationRepo.findSelectedOrganization().id + '/' + workflowStep.id + '/reorder-field-profiles/' + src + '/' + dest
        });
        var promise = WsApi.fetch(this.mapping.reorderFieldProfile);
        promise.then(function (res) {
            if (angular.fromJson(res.body).meta.status === "INVALID") {
                angular.extend(workflowStepRepo, angular.fromJson(res.body).payload);
            }
        });
        return promise;
    };


    this.addNote = function (workflowStep, note) {
        workflowStepRepo.clearValidationResults();
        OrganizationRepo.setToUpdate(workflowStep.originatingOrganization);
        angular.extend(this.mapping.addNote, {
            'method': OrganizationRepo.findSelectedOrganization().id + '/' + workflowStep.id + '/add-note',
            'data': note
        });
        var promise = WsApi.fetch(this.mapping.addNote);
        promise.then(function (res) {
            if (angular.fromJson(res.body).meta.status === "INVALID") {
                angular.extend(workflowStepRepo, angular.fromJson(res.body).payload);
            }
        });
        return promise;
    };

    this.updateNote = function (workflowStep, note) {
        workflowStepRepo.clearValidationResults();
        OrganizationRepo.setToUpdate(workflowStep.originatingOrganization);
        angular.extend(this.mapping.updateNote, {
            'method': OrganizationRepo.findSelectedOrganization().id + '/' + workflowStep.id + '/update-note',
            'data': note
        });
        var promise = WsApi.fetch(this.mapping.updateNote);
        promise.then(function (res) {
            if (angular.fromJson(res.body).meta.status === "INVALID") {
                angular.extend(workflowStepRepo, angular.fromJson(res.body).payload);
            }
        });
        return promise;
    };

    this.removeNote = function (workflowStep, note) {
        workflowStepRepo.clearValidationResults();
        angular.extend(this.mapping.removeNote, {
            'method': OrganizationRepo.findSelectedOrganization().id + '/' + workflowStep.id + '/remove-note',
            'data': note
        });
        var promise = WsApi.fetch(this.mapping.removeNote);
        promise.then(function (res) {
            if (angular.fromJson(res.body).meta.status === "INVALID") {
                angular.extend(workflowStepRepo, angular.fromJson(res.body).payload);
            }
        });
        return promise;
    };

    this.reorderNotes = function (workflowStep, src, dest) {
        workflowStepRepo.clearValidationResults();
        OrganizationRepo.setToUpdate(workflowStep.originatingOrganization);
        angular.extend(this.mapping.reorderNote, {
            'method': OrganizationRepo.findSelectedOrganization().id + '/' + workflowStep.id + '/reorder-notes/' + src + '/' + dest
        });
        var promise = WsApi.fetch(this.mapping.reorderNote);
        promise.then(function (res) {
            if (angular.fromJson(res.body).meta.status === "INVALID") {
                angular.extend(workflowStepRepo, angular.fromJson(res.body).payload);
            }
        });
        return promise;
    };

    return this;

});
