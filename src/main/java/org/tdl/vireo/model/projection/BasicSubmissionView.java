package org.tdl.vireo.model.projection;

import java.util.Calendar;
import java.util.Set;
import org.tdl.vireo.model.FieldValue;
import org.tdl.vireo.model.SubmissionStatus;

public interface BasicSubmissionView extends IdView {

    public BasicUserView getSubmitter();

    public BasicUserView getAssignee();

    public SubmissionStatus getSubmissionStatus();

    public Set<FieldValue> getFieldValues();

    public Calendar getApproveEmbargoDate();

    public Calendar getApproveApplicationDate();

    public Calendar getSubmissionDate();

    public Calendar getApproveAdvisorDate();

    public boolean getApproveEmbargo();

    public boolean getApproveApplication();

    public boolean getApproveAdvisor();

    public String getReviewerNotes();

    public String getAdvisorReviewURL();

    public String getDepositURL();
}
