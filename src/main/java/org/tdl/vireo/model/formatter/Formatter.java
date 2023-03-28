package org.tdl.vireo.model.formatter;

import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.annotation.JsonTypeInfo.Id;
import java.util.Map;
import org.tdl.vireo.model.Submission;
import org.thymeleaf.context.Context;

@JsonTypeInfo(use = Id.MINIMAL_CLASS)
public interface Formatter {

    public String getName();

    public Map<String, String> getTemplates();

    public void populateContext(Context context, Submission submission);

    public String getSuffix();

    public String getTemplateMode();

}
