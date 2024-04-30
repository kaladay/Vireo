package org.tdl.vireo.model.dto;

import java.util.Calendar;
import java.util.Set;
import org.tdl.vireo.model.CustomActionValue;
import org.tdl.vireo.model.FieldValue;
import org.tdl.vireo.model.Organization;
import org.tdl.vireo.model.SubmissionStatus;
import org.tdl.vireo.model.User;

public interface SubmissionListDto {

    public User getSubmitter();

    public User getAssignee();

    public SubmissionStatus getSubmissionStatus();

    public Organization getOrganization();

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

    //public String getLastEvent();

}
