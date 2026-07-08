public with sharing class TimeTrackingLogController {
  public class FiltersWrapper {
    public String projectId { get; set; }
    public String collaboratorId { get; set; }
    public String department { get; set; }
    public String startDate { get; set; }
    public String endDate { get; set; }
  }

  private static String timeTrackingQuery =
    'SELECT Id, Name, Date__c, StartTime__c, EndTime__c, TaskDescription__c, ' +
    'Collaborator__r.Name, Collaborator__r.Id, TotalTime__c, ' +
    'Project__r.Name, Project__r.Department__c, Project__r.ProjectOwner__r.Name, Project__r.CostCenter__c ' +
    'FROM TimeTrackingLog__c';

  @AuraEnabled
  public static List<TimeTrackingLog__c> fetchFilteredRecords(
    String jsonFilters
  ) {
    try {
      FiltersWrapper filtersWrapper = (FiltersWrapper) JSON.deserialize(
        jsonFilters,
        FiltersWrapper.class
      );
      String whereClause = getWhereClause(filtersWrapper);
      return Database.query(timeTrackingQuery + whereClause);
    } catch (Exception e) {
      throw new AuraHandledException(
        'Error deserializing filter parameters: ' +
          e.getMessage() +
          '. >> Filters: ' +
          jsonFilters
      );
    }
  }

  @TestVisible
  private static String getWhereClause(FiltersWrapper filtersWrapper) {
    String whereClause = ' WHERE Project__r.Active__c = true';

    if (!String.isEmpty(filtersWrapper.collaboratorId)) {
      whereClause +=
        ' AND Collaborator__r.Name = \'' +
        String.escapeSingleQuotes(filtersWrapper.collaboratorId) +
        '\'';
    }
    if (
      !String.isEmpty(filtersWrapper.projectId) &&
      !'All'.equals(filtersWrapper.projectId)
    ) {
      whereClause +=
        ' AND Project__r.Id = \'' +
        String.escapeSingleQuotes(filtersWrapper.projectId) +
        '\'';
    }
    if (!String.isEmpty(filtersWrapper.department)) {
      whereClause +=
        ' AND Project__r.Department__c = \'' +
        String.escapeSingleQuotes(filtersWrapper.department) +
        '\'';
    }
    if (!String.isEmpty(filtersWrapper.startDate)) {
      Date startDate = parseDateFilter(filtersWrapper.startDate, 'startDate');
      whereClause += ' AND Date__c >= ' + String.valueOf(startDate);
    }
    if (!String.isEmpty(filtersWrapper.endDate)) {
      Date endDate = parseDateFilter(filtersWrapper.endDate, 'endDate');
      whereClause += ' AND Date__c <= ' + String.valueOf(endDate);
    }

    whereClause += ' ORDER BY Date__c DESC, StartTime__c ASC';
    return whereClause;
  }

  private static Date parseDateFilter(String rawValue, String fieldLabel) {
    try {
      // Date.valueOf strictly expects ISO format: yyyy-MM-dd
      return Date.valueOf(rawValue);
    } catch (Exception e) {
      throw new AuraHandledException(
        'Invalid ' +
          fieldLabel +
          ' filter: "' +
          rawValue +
          '" is not a valid date (expected yyyy-MM-dd).'
      );
    }
  }

  @AuraEnabled(cacheable=true)
  public static List<Project__c> getAllProjects() {
    return [
      SELECT Id, Name, Department__c, ProjectOwner__r.Name, CostCenter__c
      FROM Project__c
    ];
  }
}
