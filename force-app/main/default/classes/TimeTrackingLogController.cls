public with sharing class TimeTrackingLogController {

  public class FiltersWrapper {
      public String projectId { get; set; }
      public String collaboratorId { get; set; }
      public String department { get; set; }
      public String startDate { get; set; }
      public String endDate { get; set; }
    }

  private static String timeTrackingQuery ='SELECT Id, Name, Date__c, StartTime__c, EndTime__c, TaskDescription__c, ' + 
                'Collaborator__r.Name, Collaborator__r.Id, TotalTime__c, ' +
                'Project__r.Name, Project__r.Department__c, Project__r.ProjectOwner__r.Name, Project__r.CostCenter__c ' + 
                'FROM TimeTrackingLog__c';

  @AuraEnabled
  public static List<TimeTrackingLog__c> fetchFilteredRecords(String jsonFilters) {
    try {
      FiltersWrapper filtersWrapper = (FiltersWrapper) JSON.deserialize(jsonFilters, FiltersWrapper.class);
      String whereClause = getWhereClause(filtersWrapper);
      return Database.query(timeTrackingQuery + whereClause);
    } catch (Exception e) {
      throw new AuraHandledException(
        'Error deserializing filter parameters: ' + e.getMessage() + '. >> Filters: ' + jsonFilters
      );
    }
  }

  private static String getWhereClause(FiltersWrapper filtersWrapper) {
    String whereClause = ' WHERE Project__r.Active__c = true';
    if (!String.isEmpty(filtersWrapper.collaboratorId)) {
      whereClause += ' AND Collaborator__r.Name = \'' + filtersWrapper.collaboratorId + '\'';
    }
    if (
      !String.isEmpty(filtersWrapper.projectId) &&
      !'All'.equals(filtersWrapper.projectId)
    ) {
      whereClause += ' AND Project__r.Id = \'' + filtersWrapper.projectId + '\'';
    }
    if (!String.isEmpty(filtersWrapper.department)) {
      whereClause += ' AND Project__r.Department__c = \'' + filtersWrapper.department + '\'';
    }
    if (!String.isEmpty(filtersWrapper.startDate)) {
      whereClause += ' AND Date__c >= ' + filtersWrapper.startDate;
    }
    if (!String.isEmpty(filtersWrapper.endDate)) {
      whereClause += ' AND Date__c <= ' + filtersWrapper.endDate;
    }
    whereClause += ' ORDER BY Date__c DESC, StartTime__c ASC';
    return whereClause;
  }

  @AuraEnabled(cacheable=true)
  public static List<Project__c> getAllProjects() {
    return [
      SELECT Id, Name, Department__c, ProjectOwner__r.Name, CostCenter__c
      FROM Project__c
    ];
  }
}
