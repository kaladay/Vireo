package org.tdl.vireo.view;

import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.JsonIdentityReference;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonView;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
import java.util.Set;
import org.tdl.vireo.model.OrganizationCategory;
import org.tdl.vireo.model.response.Views;

public interface TreeOrganizationView extends SimpleNamedModelView {

    @JsonView(Views.SubmissionList.class)
    public OrganizationCategory getCategory();

    @JsonView(Views.Partial.class)
    public Boolean getAcceptsSubmissions();

    @JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, scope = TreeOrganizationView.class, property = "id")
    @JsonIdentityReference(alwaysAsId = true)
    @JsonView(Views.Partial.class)
    public TreeOrganizationView getParentOrganization();

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    @JsonView(Views.Partial.class)
    public Set<TreeOrganizationView> getChildrenOrganizations();
}
