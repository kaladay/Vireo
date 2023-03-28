package org.tdl.vireo.model.repo;

import edu.tamu.weaver.auth.model.repo.AbstractWeaverUserRepo;
import edu.tamu.weaver.user.model.IRole;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.tdl.vireo.model.User;
import org.tdl.vireo.model.projection.IdView;
import org.tdl.vireo.model.repo.custom.UserRepoCustom;

public interface UserRepo extends AbstractWeaverUserRepo<User>, UserRepoCustom {

    public <T extends IdView> T findById(Long id, Class<T> projection);

    public <T extends IdView> T findByEmail(String email, Class<T> projection);

    public <T extends IdView> List<T> findAllBy(Class<T> projection);

    public <T extends IdView> List<T> findAllByRoleIn(List<IRole> role, Sort sort, Class<T> projection);

    public <T extends IdView> List<T> findAllByRoleIn(List<IRole> role, Pageable pageable, Class<T> projection);

    public <T extends IdView> List<T> findAllByRoleInAndNameContainsIgnoreCase(List<IRole> role, String name, Sort sort, Class<T> projection);

    public <T extends IdView> List<T> findAllByRoleInAndNameContainsIgnoreCase(List<IRole> role, String name, Pageable pageable, Class<T> projection);

    public Page<User> findAll(Specification<User> specification, Pageable pageable);
    
    public <T> Page<T> findAllBy(Pageable pageable, Class<T> projection);

    public Long countByRoleIn(List<IRole> role);

    public Long countByRoleInAndNameContainsIgnoreCase(List<IRole> role, String name);

}
