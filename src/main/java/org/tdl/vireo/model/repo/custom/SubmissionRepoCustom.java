package org.tdl.vireo.model.repo.custom;

import edu.tamu.weaver.auth.model.Credentials;
import java.util.List;
import java.util.concurrent.ExecutionException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;
import org.tdl.vireo.exception.OrganizationDoesNotAcceptSubmissionsException;
import org.tdl.vireo.model.NamedSearchFilterGroup;
import org.tdl.vireo.model.Organization;
import org.tdl.vireo.model.Submission;
import org.tdl.vireo.model.SubmissionListColumn;
import org.tdl.vireo.model.SubmissionStatus;
import org.tdl.vireo.model.User;

public interface SubmissionRepoCustom {

    public Submission create(User submitter, Organization organization, SubmissionStatus submissionStatus, Credentials credentials) throws OrganizationDoesNotAcceptSubmissionsException;

    public Submission update(Submission submission);

    public void delete(Submission submission);

    @Transactional
    @Modifying
    public Submission updateStatus(Submission submission, SubmissionStatus status, User user);

    public Page<Submission> pageableDynamicSubmissionQuery(NamedSearchFilterGroup activeFilter, List<SubmissionListColumn> submissionListColums, Pageable pageable) throws ExecutionException;

    public List<Submission> batchDynamicSubmissionQuery(NamedSearchFilterGroup activeFilter, List<SubmissionListColumn> submissionListColums);

}
