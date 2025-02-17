package org.tdl.vireo.model.repo.impl;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.tdl.vireo.model.DepositLocation;
import org.tdl.vireo.model.packager.Packager;
import org.tdl.vireo.model.repo.AbstractPackagerRepo;
import org.tdl.vireo.model.repo.DepositLocationRepo;
import org.tdl.vireo.model.repo.custom.DepositLocationRepoCustom;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import edu.tamu.weaver.data.model.repo.impl.AbstractWeaverOrderedRepoImpl;

public class DepositLocationRepoImpl extends AbstractWeaverOrderedRepoImpl<DepositLocation, DepositLocationRepo> implements DepositLocationRepoCustom {

    @Autowired
    private DepositLocationRepo depositLocationRepo;

    @Autowired
    private AbstractPackagerRepo packagerRepo;

    @Autowired
    private ObjectMapper objectMapper;

    @Override
    public void remove(DepositLocation depositLocation) {
        depositLocation.setPackager(null);
        depositLocation = depositLocationRepo.save(depositLocation);
        super.remove(depositLocation);
    }

    @Override
    public DepositLocation create(Map<String, Object> depositLocationJson) {
        Packager<?> packager = packagerRepo.findById(objectMapper.convertValue(depositLocationJson.get("packager"), JsonNode.class).get("id").asLong()).get();

        String onBehalfOf = null;
        if (depositLocationJson.get("onBehalfOf") != null) {
            onBehalfOf = (String) depositLocationJson.get("onBehalfOf");
        }

        Integer timeout = Integer.valueOf((String) depositLocationJson.getOrDefault("timeout", "240"));

        return create((String) depositLocationJson.get("name"), (String) depositLocationJson.get("repository"), (String) depositLocationJson.get("collection"), (String) depositLocationJson.get("username"), (String) depositLocationJson.get("password"), onBehalfOf, packager, (String) depositLocationJson.get("depositorName"), timeout);
    }

    @Override
    public DepositLocation create(String name, String repository, String collection, String username, String password, String onBehalfOf, Packager<?> packager, String depositor, int timeout) {
        DepositLocation depositLocation = createDetached(name, repository, collection, username, password, onBehalfOf, packager, depositor, timeout);
        depositLocation.setPosition(depositLocationRepo.count() + 1);
        return super.create(depositLocation);
    }

    @Override
    public DepositLocation createDetached(Map<String, Object> depositLocationJson) {
        Packager<?> packager = null;
        if (depositLocationJson.get("packager") != null) {
            packager = packagerRepo.findById(objectMapper.convertValue(depositLocationJson.get("packager"), JsonNode.class).get("id").asLong()).get();
        }

        String onBehalfOf = null;
        if (depositLocationJson.get("onBehalfOf") != null) {
            onBehalfOf = (String) depositLocationJson.get("onBehalfOf");
        }

        Integer timeout = null;
        if (depositLocationJson.get("timeout") != null) {
            timeout = Integer.valueOf(depositLocationJson.get("timeout").toString());
        }

        return createDetached((String) depositLocationJson.get("name"), (String) depositLocationJson.get("repository"), null, (String) depositLocationJson.get("username"), (String) depositLocationJson.get("password"), onBehalfOf, packager, (String) depositLocationJson.get("depositorName"), timeout);
    }

    @Override
    public DepositLocation createDetached(String name, String repository, String collection, String username, String password, String onBehalfOf, Packager<?> packager, String depositor, int timeout) {
        return new DepositLocation(name, repository, collection, username, password, onBehalfOf, packager, depositor, timeout);
    }

    @Override
    public Class<?> getModelClass() {
        return DepositLocation.class;
    }

    @Override
    protected String getChannel() {
        return "/channel/deposit-location";
    }

}
