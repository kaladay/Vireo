package org.tdl.vireo.view;

import java.util.List;
import org.tdl.vireo.model.EmailWorkflowRule;

public interface ShallowOrganizationView extends TreeOrganizationView {

    public List<String> getEmails();

    public List<EmailWorkflowRule> getEmailWorkflowRules();
}
