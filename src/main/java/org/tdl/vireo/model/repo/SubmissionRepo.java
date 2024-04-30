package org.tdl.vireo.model.repo;

import edu.tamu.weaver.data.model.repo.WeaverRepo;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.tdl.vireo.model.Organization;
import org.tdl.vireo.model.Submission;
import org.tdl.vireo.model.User;
import org.tdl.vireo.model.repo.custom.SubmissionRepoCustom;

public interface SubmissionRepo extends WeaverRepo<Submission>, SubmissionRepoCustom {

    public <T> List<T> findAllViewBySubmitterId(Long submitterId, Class<T> type);

    public List<Submission> findAllBySubmitterAndOrganization(User submitter, Organization organization);

    public List<Submission> findByOrganization(Organization organization);

    public List<Submission> findByActionLogsId(Long id);

    @EntityGraph(value = "graph.Submission.Individual")
    public List<Submission> findAllBySubmitterId(Long submitterId);

    @Override
    @EntityGraph(value = "graph.Submission.Individual")
    public Optional<Submission> findById(Long id);

    @Override
    @EntityGraph(value = "graph.Submission.List")
    public List<Submission> findAllById(Iterable<Long> ids);

    //@Override
    //@EntityGraph(value = "graph.Submission.List")
    public List<Submission> findAllByIdIn(Iterable<Long> ids);

    public <T> List<T> findViewAllByIdIn(Iterable<Long> ids, Class<T> type);

    public Submission findOneBySubmitterAndId(User submitter, Long id);

    public Submission findOneByAdvisorAccessHash(String hash);

    public Submission findByCustomActionValuesDefinitionLabel(String label);

    public Long countByOrganizationId(Long id);

    @Override
    public Submission update(Submission submission);

    @Override
    public void delete(Submission submission);

}
