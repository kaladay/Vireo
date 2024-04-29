package org.tdl.vireo.model.repo.custom;

import java.util.List;
import org.tdl.vireo.model.FieldPredicate;
import org.tdl.vireo.model.FieldValue;

public interface FieldValueRepoCustom {

    public FieldValue create(FieldPredicate fieldPredicate);

    public List<String> getAllValuesByFieldPredicateValue(String fieldPredicateValue);

}
