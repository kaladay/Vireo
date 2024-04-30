package org.tdl.vireo.model.dto;

import java.util.HashMap;
import java.util.Map;

/**
 * A map of field names and values as part of a list for a generic table response.
 */
public class TableMapRow {
    private Long id;

    private Map<String, String> map;

    public TableMapRow() {
        map = new HashMap<>();
    }

    public TableMapRow(Long id) {
        this.id = id;
        this.map = new HashMap<>();
    }

    public TableMapRow(Map<String, String> map) {
        this.map = map;
    }

    public TableMapRow(Long id, Map<String, String> map) {
        this.id = id;
        this.map = map;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Map<String, String> getMap() {
        return map;
    }

    public void setMap(Map<String, String> map) {
        this.map = map;
    }
}
