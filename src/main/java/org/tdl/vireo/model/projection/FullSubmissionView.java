package org.tdl.vireo.model.projection;

import java.util.List;
import org.tdl.vireo.model.SubmissionWorkflowStep;

public interface FullSubmissionView extends BasicSubmissionView, ActionLogSubmissionView, CustomActionValueSubmissionView, OrganizationSubmissionView {

    public List<SubmissionWorkflowStep> getSubmissionWorkflowSteps();
}
