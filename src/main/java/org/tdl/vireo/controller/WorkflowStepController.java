package org.tdl.vireo.controller;

import static edu.tamu.weaver.response.ApiStatus.ERROR;
import static edu.tamu.weaver.response.ApiStatus.SUCCESS;
import static edu.tamu.weaver.validation.model.BusinessValidationType.CREATE;
import static edu.tamu.weaver.validation.model.BusinessValidationType.DELETE;
import static edu.tamu.weaver.validation.model.BusinessValidationType.UPDATE;
import static edu.tamu.weaver.validation.model.MethodValidationType.LIST_REORDER;
import static org.springframework.web.bind.annotation.RequestMethod.POST;

import com.fasterxml.jackson.core.JsonProcessingException;
import edu.tamu.weaver.response.ApiResponse;
import edu.tamu.weaver.validation.aspect.annotation.WeaverValidatedModel;
import edu.tamu.weaver.validation.aspect.annotation.WeaverValidation;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;
import org.tdl.vireo.exception.ComponentNotPresentOnOrgException;
import org.tdl.vireo.exception.HeritableModelNonOverrideableException;
import org.tdl.vireo.exception.WorkflowStepNonOverrideableException;
import org.tdl.vireo.model.FieldProfile;
import org.tdl.vireo.model.ManagedConfiguration;
import org.tdl.vireo.model.Note;
import org.tdl.vireo.model.Organization;
import org.tdl.vireo.model.WorkflowStep;
import org.tdl.vireo.model.repo.ConfigurationRepo;
import org.tdl.vireo.model.repo.FieldProfileRepo;
import org.tdl.vireo.model.repo.NoteRepo;
import org.tdl.vireo.model.repo.OrganizationRepo;
import org.tdl.vireo.model.repo.WorkflowStepRepo;

@RestController
@RequestMapping("/workflow-step")
public class WorkflowStepController {

    @Autowired
    private OrganizationRepo organizationRepo;

    @Autowired
    private WorkflowStepRepo workflowStepRepo;

    @Autowired
    private FieldProfileRepo fieldProfileRepo;

    @Autowired
    private ConfigurationRepo configurationRepo;

    @Autowired
    private NoteRepo noteRepo;

    @RequestMapping("/all")
    @PreAuthorize("hasRole('MANAGER')")
    public ApiResponse getAll() {
        return new ApiResponse(SUCCESS, workflowStepRepo.findAll());
    }

    @RequestMapping("/get/{workflowStepId}")
    public ApiResponse getStepById(@PathVariable Long workflowStepId) {
        WorkflowStep workflowStep = workflowStepRepo.findById(workflowStepId).get();
        return (workflowStep != null) ? new ApiResponse(SUCCESS, workflowStep) : new ApiResponse(ERROR, "No workflow step for id [" + workflowStepId.toString() + "]");
    }

    @RequestMapping(value = "/{requestingOrgId}/{workflowStepId}/add-field-profile", method = RequestMethod.POST)
    @PreAuthorize("hasRole('MANAGER')")
    @WeaverValidation(business = { @WeaverValidation.Business(value = CREATE) })
    public ApiResponse createFieldProfile(@PathVariable Long requestingOrgId, @PathVariable Long workflowStepId, @WeaverValidatedModel FieldProfile fieldProfile) throws WorkflowStepNonOverrideableException, JsonProcessingException, ComponentNotPresentOnOrgException {
        WorkflowStep workflowStep = workflowStepRepo.findById(workflowStepId).get();
        Organization requestingOrganization = organizationRepo.findById(requestingOrgId).get();
        if (!requestingOrganization.getId().equals(workflowStep.getOriginatingOrganization().getId())) {
            workflowStep = workflowStepRepo.update(workflowStep, requestingOrganization);
        }
        fieldProfileRepo.create(workflowStep, fieldProfile.getFieldPredicate(), fieldProfile.getInputType(), fieldProfile.getUsage(), fieldProfile.getHelp(), fieldProfile.getGloss(), fieldProfile.getRepeatable(), fieldProfile.getOverrideable(), fieldProfile.getEnabled(), fieldProfile.getOptional(), fieldProfile.getFlagged(), fieldProfile.getLogged(), fieldProfile.getControlledVocabulary(), fieldProfile.getDefaultValue());
        organizationRepo.broadcast(organizationRepo.findAllByOrderByIdAsc());
        return new ApiResponse(SUCCESS);
    }

    @RequestMapping(value = "/{requestingOrgId}/{workflowStepId}/update-field-profile", method = RequestMethod.POST)
    @PreAuthorize("hasRole('MANAGER')")
    @WeaverValidation(business = { @WeaverValidation.Business(value = UPDATE) })
    public ApiResponse updateFieldProfile(@PathVariable Long requestingOrgId, @PathVariable Long workflowStepId, @WeaverValidatedModel FieldProfile fieldProfile) throws WorkflowStepNonOverrideableException, JsonProcessingException, HeritableModelNonOverrideableException, ComponentNotPresentOnOrgException {
        ManagedConfiguration mappedShibAttribute = fieldProfile.getMappedShibAttribute();
        if (mappedShibAttribute != null && mappedShibAttribute.getId() == null) {
            ManagedConfiguration persistedMappedShibAttribute = configurationRepo.findByNameAndType(mappedShibAttribute.getName(), mappedShibAttribute.getType());
            if (persistedMappedShibAttribute == null) {
                persistedMappedShibAttribute = configurationRepo.create(mappedShibAttribute);
            }
            fieldProfile.setMappedShibAttribute(persistedMappedShibAttribute);
        }
        fieldProfileRepo.update(fieldProfile, organizationRepo.findById(requestingOrgId).get());
        organizationRepo.broadcast(organizationRepo.findAllByOrderByIdAsc());
        return new ApiResponse(SUCCESS);
    }

    @RequestMapping(value = "/{requestingOrgId}/{workflowStepId}/remove-field-profile", method = RequestMethod.POST)
    @PreAuthorize("hasRole('MANAGER')")
    @WeaverValidation(business = { @WeaverValidation.Business(value = DELETE) })
    public ApiResponse removeFieldProfile(@PathVariable Long requestingOrgId, @PathVariable Long workflowStepId, @WeaverValidatedModel FieldProfile fieldProfile) throws WorkflowStepNonOverrideableException, HeritableModelNonOverrideableException, ComponentNotPresentOnOrgException {
        WorkflowStep workflowStep = workflowStepRepo.findById(workflowStepId).get();
        FieldProfile persistedFieldProfile = fieldProfileRepo.findById(fieldProfile.getId()).get();
        fieldProfileRepo.removeFromWorkflowStep(organizationRepo.findById(requestingOrgId).get(), workflowStep, persistedFieldProfile);
        // If the field profile is being removed from its originating workflow step by the organization that originates that step, then it should be deleted.
        if (persistedFieldProfile.getOriginatingWorkflowStep().getId().equals(workflowStep.getId()) && workflowStep.getOriginatingOrganization().getId().equals(requestingOrgId)) {
            fieldProfileRepo.delete(persistedFieldProfile);
        }

        organizationRepo.broadcast(organizationRepo.findAllByOrderByIdAsc());

        return new ApiResponse(SUCCESS);
    }

    @PostMapping(value = "/{requestingOrgId}/{workflowStepId}/remove-field-profile/{fieldProfileId}")
    @PreAuthorize("hasRole('MANAGER')")
    public ApiResponse removeFieldProfileById(@PathVariable Long requestingOrgId, @PathVariable Long workflowStepId, @PathVariable Long fieldProfileId) throws WorkflowStepNonOverrideableException, HeritableModelNonOverrideableException, ComponentNotPresentOnOrgException {
        Optional<Organization> organization = organizationRepo.findById(requestingOrgId);

        if (organization.isEmpty()) {
            return new ApiResponse(ERROR, "Cannot delete Field Profile, the given Organization is unknown.");
        }

        Optional<WorkflowStep> workflowStep = workflowStepRepo.findById(workflowStepId);

        if (workflowStep.isEmpty()) {
            return new ApiResponse(ERROR, "Cannot delete Field Profile, the given Workflow Step is unknown.");
        }

        Optional<FieldProfile> fieldProfile = fieldProfileRepo.findById(fieldProfileId);

        if (fieldProfile.isEmpty()) {
            return new ApiResponse(ERROR, "Cannot delete unknown Field Profile.");
        }

        fieldProfileRepo.removeFromWorkflowStep(organization.get(), workflowStep.get(), fieldProfile.get());

        // If the field profile is being removed from its originating workflow step by the organization that originates that step, then it should be deleted.
        if (fieldProfile.get().getOriginatingWorkflowStep().getId().equals(workflowStepId) && workflowStep.get().getOriginatingOrganization().getId().equals(requestingOrgId)) {
            fieldProfileRepo.deleteById(fieldProfileId);
        }

        organizationRepo.broadcast(organizationRepo.findAllByOrderByIdAsc());

        return new ApiResponse(SUCCESS);
    }

    @RequestMapping("/{requestingOrgId}/{workflowStepId}/reorder-field-profiles/{src}/{dest}")
    @PreAuthorize("hasRole('MANAGER')")
    @WeaverValidation(method = { @WeaverValidation.Method(value = LIST_REORDER, model = FieldProfile.class, params = { "2", "3", "1", "aggregateFieldProfiles" }) })
    public ApiResponse reorderFieldProfiles(@PathVariable Long requestingOrgId, @PathVariable Long workflowStepId, @PathVariable Integer src, @PathVariable Integer dest) throws WorkflowStepNonOverrideableException, ComponentNotPresentOnOrgException {
        WorkflowStep workflowStep = workflowStepRepo.findById(workflowStepId).get();
        workflowStepRepo.reorderFieldProfiles(organizationRepo.findById(requestingOrgId).get(), workflowStep, src, dest);
        organizationRepo.broadcast(requestingOrgId);
        return new ApiResponse(SUCCESS);
    }

    @RequestMapping(value = "/{requestingOrgId}/{workflowStepId}/add-note", method = RequestMethod.POST)
    @PreAuthorize("hasRole('MANAGER')")
    @WeaverValidation(business = { @WeaverValidation.Business(value = CREATE) })
    public ApiResponse addNote(@PathVariable Long requestingOrgId, @PathVariable Long workflowStepId, @WeaverValidatedModel Note note) throws WorkflowStepNonOverrideableException, ComponentNotPresentOnOrgException {
        WorkflowStep workflowStep = workflowStepRepo.findById(workflowStepId).get();
        Organization requestingOrganization = organizationRepo.findById(requestingOrgId).get();
        if (!requestingOrganization.getId().equals(workflowStep.getOriginatingOrganization().getId())) {
            workflowStep = workflowStepRepo.update(workflowStep, requestingOrganization);
        }
        noteRepo.create(workflowStep, note.getName(), note.getText(), note.getOverrideable());
        organizationRepo.broadcast(organizationRepo.findAllByOrderByIdAsc());
        return new ApiResponse(SUCCESS);
    }

    @PreAuthorize("hasRole('MANAGER')")
    @RequestMapping(value = "/{requestingOrgId}/{workflowStepId}/update-note", method = POST)
    @WeaverValidation(business = { @WeaverValidation.Business(value = UPDATE) })
    public ApiResponse updateNote(@PathVariable Long requestingOrgId, @PathVariable Long workflowStepId, @WeaverValidatedModel Note note) throws WorkflowStepNonOverrideableException, HeritableModelNonOverrideableException, ComponentNotPresentOnOrgException {
        noteRepo.update(note, organizationRepo.findById(requestingOrgId).get());
        organizationRepo.broadcast(organizationRepo.findAllByOrderByIdAsc());
        return new ApiResponse(SUCCESS);
    }

    @PreAuthorize("hasRole('MANAGER')")
    @RequestMapping(value = "/{requestingOrgId}/{workflowStepId}/remove-note", method = POST)
    @WeaverValidation(business = { @WeaverValidation.Business(value = DELETE) })
    public ApiResponse removeNote(@PathVariable Long requestingOrgId, @PathVariable Long workflowStepId, @WeaverValidatedModel Note note) throws NumberFormatException, WorkflowStepNonOverrideableException, HeritableModelNonOverrideableException, ComponentNotPresentOnOrgException {
        WorkflowStep workflowStep = workflowStepRepo.findById(workflowStepId).get();
        Note persistedNote = noteRepo.findById(note.getId()).get();
        noteRepo.removeFromWorkflowStep(organizationRepo.findById(requestingOrgId).get(), workflowStep, persistedNote);
        if (persistedNote.getOriginatingWorkflowStep().getId().equals(workflowStep.getId())) {
            noteRepo.delete(persistedNote);
        }
        organizationRepo.broadcast(organizationRepo.findAllByOrderByIdAsc());
        return new ApiResponse(SUCCESS);
    }

    @RequestMapping("/{requestingOrgId}/{workflowStepId}/reorder-notes/{src}/{dest}")
    @PreAuthorize("hasRole('MANAGER')")
    @WeaverValidation(method = { @WeaverValidation.Method(value = LIST_REORDER, model = WorkflowStep.class, params = { "2", "3", "1", "aggregateNotes" }) })
    public ApiResponse reorderNotes(@PathVariable Long requestingOrgId, @PathVariable Long workflowStepId, @PathVariable Integer src, @PathVariable Integer dest) throws NumberFormatException, WorkflowStepNonOverrideableException, ComponentNotPresentOnOrgException {
        WorkflowStep workflowStep = workflowStepRepo.findById(workflowStepId).get();
        workflowStepRepo.reorderNotes(organizationRepo.findById(requestingOrgId).get(), workflowStep, src, dest);
        organizationRepo.broadcast(organizationRepo.findAllByOrderByIdAsc());
        return new ApiResponse(SUCCESS);
    }

}
