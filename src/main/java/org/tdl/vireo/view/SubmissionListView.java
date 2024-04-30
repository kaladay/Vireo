package org.tdl.vireo.view;

import java.util.Calendar;
import java.util.Set;
import org.tdl.vireo.model.CustomActionValue;
import org.tdl.vireo.model.FieldValue;

public interface SubmissionListView extends SimpleSubmissionView {

    // TODO this!
    public Set<FieldValue> getFieldValues();

    public Calendar getApproveEmbargoDate();

    public Calendar getApproveApplicationDate();

    public Calendar getSubmissionDate();

    public Calendar getApproveAdvisorDate();

    public boolean getApproveEmbargo();

    public boolean getApproveApplication();

    public boolean getApproveAdvisor();

    public Set<CustomActionValue> getCustomActionValues();

    public String getReviewerNotes();

    public String getDepositURL();
}
