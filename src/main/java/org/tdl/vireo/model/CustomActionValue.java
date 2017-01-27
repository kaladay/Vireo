package org.tdl.vireo.model;

import static javax.persistence.CascadeType.DETACH;
import static javax.persistence.CascadeType.MERGE;
import static javax.persistence.CascadeType.REFRESH;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.ManyToOne;

import org.tdl.vireo.model.validation.CustomActionValueValidator;

import edu.tamu.framework.model.BaseEntity;

/**
 * The value of a custom action associated with a particular submission.
 * 
 */
@Entity
public class CustomActionValue extends BaseEntity {
    
    @ManyToOne(cascade = { DETACH, REFRESH, MERGE }, optional = false)
    private CustomActionDefinition definition;

    @Column(nullable = false)
    private Boolean value;

    public CustomActionValue() { 
        setModelValidator(new CustomActionValueValidator());
    }

    public CustomActionValue(CustomActionDefinition definition, Boolean value) {
        this();
        setDefinition(definition);
        setValue(value);
    }

    /**
     * @return the definition
     */
    public CustomActionDefinition getDefinition() {
        return definition;
    }

    /**
     * @param definition
     *            the definition to set
     */
    public void setDefinition(CustomActionDefinition definition) {
        this.definition = definition;
    }

    /**
     * @return the value
     */
    public Boolean getValue() {
        return value;
    }

    /**
     * @param value
     *            the value to set
     */
    public void setValue(Boolean value) {
        this.value = value;
    }

}
