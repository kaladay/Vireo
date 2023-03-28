package org.tdl.vireo.model.projection;

import edu.tamu.weaver.user.model.IRole;

public interface BasicUserView extends IdView {

    public String getNetid();

    public String getEmail();

    public String getFirstName();

    public String getLastName();

    public String getMiddleName();

    public String getName();

    public IRole getRole();

    public String getOrcid();

}
