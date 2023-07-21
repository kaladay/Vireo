package org.tdl.vireo.view;

import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.JsonIdentityReference;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
import java.util.List;
import org.tdl.vireo.model.EmailWorkflowRule;

public interface ShallowOrganizationView extends TreeOrganizationView {

    @JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, scope = SimpleNamedModelView.class, property = "id")
    @JsonIdentityReference(alwaysAsId = true)
    public List<SimpleNamedModelView> getOriginalWorkflowSteps();

    public List<String> getEmails();

    public List<EmailWorkflowRule> getEmailWorkflowRules();
}
