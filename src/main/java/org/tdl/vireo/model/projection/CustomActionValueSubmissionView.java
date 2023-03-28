package org.tdl.vireo.model.projection;

import java.util.Set;
import org.tdl.vireo.model.CustomActionValue;

public interface CustomActionValueSubmissionView extends IdView {

    public Set<CustomActionValue> getCustomActionValues();
}
