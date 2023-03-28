package org.tdl.vireo.model.projection;

import java.util.Set;
import org.tdl.vireo.model.ActionLog;

public interface ActionLogSubmissionView extends IdView {

    public Set<ActionLog> getActionLogs();
}
