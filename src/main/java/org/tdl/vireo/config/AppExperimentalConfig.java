package org.tdl.vireo.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "app.experimental")
public class AppExperimentalConfig {

    private Boolean adminListTableJDBC;

    public Boolean getAdminListTableJDBC() {
        return adminListTableJDBC;
    }

    public void setAdminListTableJDBC(Boolean adminListTableJDBC) {
        this.adminListTableJDBC = adminListTableJDBC;
    }

}
