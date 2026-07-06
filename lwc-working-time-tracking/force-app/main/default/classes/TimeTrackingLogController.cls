public with sharing class TimeTrackingLogController {
  @AuraEnabled(cacheable=true)
  public static List<TimeTrackingLog__c> getAllRecords() {
    return [
      SELECT
        Id,
        Name,
        Date__c,
        StartTime__c,
        EndTime__c,
        TaskDescription__c,
        Collaborator__r.Name,
        Project__r.Name,
        Project__r.Department__c,
        Project__r.ProjectOwner__r.Name,
        Project__r.CostCenter__c
      FROM TimeTrackingLog__c
    ];
  }

  @AuraEnabled(cacheable=true)
  public static List<Project__c> getAllProjectsForFilter() {
    return [
      SELECT Id, Name, Department__c, ProjectOwner__r.Name, CostCenter__c
      FROM Project__c
    ];
  }
}
