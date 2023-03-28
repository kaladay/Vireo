package org.tdl.vireo.model.packager;

import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.annotation.JsonTypeInfo.Id;
import java.util.List;
import java.util.Map;
import org.tdl.vireo.model.Submission;
import org.tdl.vireo.model.SubmissionListColumn;
import org.tdl.vireo.model.export.ExportPackage;
import org.tdl.vireo.model.formatter.AbstractFormatter;

@JsonTypeInfo(use = Id.MINIMAL_CLASS)
public interface Packager<EP extends ExportPackage> {

    public String getName();

    public String getMimeType();

    public String getFileExtension();

    public AbstractFormatter getFormatter();

    public EP packageExport(Submission submission, String manifest);

    public EP packageExport(Submission submission, List<SubmissionListColumn> columns);

    public EP packageExport(Submission submission, Map<String,String> dsDocs);

}
