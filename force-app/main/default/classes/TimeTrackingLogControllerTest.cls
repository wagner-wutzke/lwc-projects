/**
 * Test class for TimeTrackingLogController.
 *
 * SCHEMA ASSUMPTIONS:
 *  - Collaborator__c is a Contact object,
 *    referenced from TimeTrackingLog__c via a lookup field called Collaborator__c.
 *  - Project__c.ProjectOwner__c is a lookup to a Contact.
 *  - TimeTrackingLog__c.Project__c is a lookup to Project__c.
 *  - Project__c.Active__c is a Checkbox field.
 *  - Project__c.ShortName is a short name (with acronyms) for the project.
 *  - TimeTrackingLog__c.StartTime__c / EndTime__c are Time fields.
 *  - TimeTrackingLog__c.TotalTime__c is a formula field.
 */
@isTest
private class TimeTrackingLogControllerTest {
  @TestSetup
  static void setupData() {
    // Collaborator
    Contact collaborator = new Contact(
      FirstName = 'John',
      LastName = 'Doe',
      Email = 'john.doe@apex.com'
    );
    insert collaborator;

    Contact projectOwner = new Contact(
      FirstName = 'Walter',
      LastName = 'White',
      Email = 'walter.white@apex.com'
    );
    insert projectOwner;

    // Active project
    Project__c activeProject = new Project__c(
      ShortName__c = 'Test Project',
      Department__c = 'IT',
      CostCenter__c = 'CC-100',
      Active__c = true,
      ProjectOwner__c = projectOwner.Id
    );
    insert activeProject;

    // Inactive project - logs under this should never be returned by fetchFilteredRecords
    Project__c inactiveProject = new Project__c(
      ShortName__c = 'Inactive Project',
      Department__c = 'Finances',
      CostCenter__c = 'CC-200',
      Active__c = false,
      ProjectOwner__c = projectOwner.Id
    );
    insert inactiveProject;

    // Logs under the active project
    TimeTrackingLog__c logToday = new TimeTrackingLog__c(
      Date__c = Date.today(),
      StartTime__c = Time.newInstance(9, 0, 0, 0),
      EndTime__c = Time.newInstance(17, 0, 0, 0),
      TaskDescription__c = 'Worked on feature X',
      Collaborator__c = collaborator.Id,
      Project__c = activeProject.Id
    );

    TimeTrackingLog__c logPast = new TimeTrackingLog__c(
      Date__c = Date.today().addDays(-5),
      StartTime__c = Time.newInstance(10, 0, 0, 0),
      EndTime__c = Time.newInstance(15, 0, 0, 0),
      TaskDescription__c = 'Worked on feature Y',
      Collaborator__c = collaborator.Id,
      Project__c = activeProject.Id
    );

    // Log under the inactive project - should be excluded by the base WHERE clause
    TimeTrackingLog__c logInactiveProject = new TimeTrackingLog__c(
      Date__c = Date.today(),
      StartTime__c = Time.newInstance(9, 0, 0, 0),
      EndTime__c = Time.newInstance(17, 0, 0, 0),
      TaskDescription__c = 'Should never be returned',
      Collaborator__c = collaborator.Id,
      Project__c = inactiveProject.Id
    );

    insert new List<TimeTrackingLog__c>{
      logToday,
      logPast,
      logInactiveProject
    };
  }

  @isTest
  static void testFetchFilteredRecords_NoFilters() {
    TimeTrackingLogController.FiltersWrapper filters = new TimeTrackingLogController.FiltersWrapper();
    String jsonFilters = JSON.serialize(filters);

    Test.startTest();
    List<TimeTrackingLog__c> results = TimeTrackingLogController.fetchFilteredRecords(
      jsonFilters
    );
    Test.stopTest();

    System.assertEquals(
      2,
      results.size(),
      'Only logs tied to active projects should be returned'
    );
  }

  @isTest
  static void testFetchFilteredRecords_ByProjectId() {
    Project__c project = [
      SELECT Id
      FROM Project__c
      WHERE ShortName__c = 'Test Project'
      LIMIT 1
    ];

    TimeTrackingLogController.FiltersWrapper filters = new TimeTrackingLogController.FiltersWrapper();
    filters.projectId = project.Id;
    String jsonFilters = JSON.serialize(filters);

    Test.startTest();
    List<TimeTrackingLog__c> results = TimeTrackingLogController.fetchFilteredRecords(
      jsonFilters
    );
    Test.stopTest();

    System.assertEquals(
      2,
      results.size(),
      'Should return logs for the specified active project'
    );
    for (TimeTrackingLog__c log : results) {
      System.assertEquals(
        project.Id,
        log.Project__c,
        'Every returned log should belong to the filtered project'
      );
    }
  }

  @isTest
  static void testFetchFilteredRecords_ProjectIdAll_IsIgnored() {
    TimeTrackingLogController.FiltersWrapper filters = new TimeTrackingLogController.FiltersWrapper();
    filters.projectId = 'All';
    String jsonFilters = JSON.serialize(filters);

    Test.startTest();
    List<TimeTrackingLog__c> results = TimeTrackingLogController.fetchFilteredRecords(
      jsonFilters
    );
    Test.stopTest();

    System.assertEquals(
      2,
      results.size(),
      '"All" should not add a project filter, only the base active-project filter applies'
    );
  }

  @isTest
  static void testFetchFilteredRecords_ByCollaboratorName() {
    TimeTrackingLogController.FiltersWrapper filters = new TimeTrackingLogController.FiltersWrapper();
    filters.collaboratorId = 'John Doe';
    String jsonFilters = JSON.serialize(filters);

    Test.startTest();
    List<TimeTrackingLog__c> results = TimeTrackingLogController.fetchFilteredRecords(
      jsonFilters
    );
    Test.stopTest();

    System.assertEquals(
      2,
      results.size(),
      'Should return logs matching the collaborator name'
    );
  }

  @isTest
  static void testFetchFilteredRecords_ByDepartment() {
    TimeTrackingLogController.FiltersWrapper filters = new TimeTrackingLogController.FiltersWrapper();
    filters.department = 'IT';
    String jsonFilters = JSON.serialize(filters);

    Test.startTest();
    List<TimeTrackingLog__c> results = TimeTrackingLogController.fetchFilteredRecords(
      jsonFilters
    );
    Test.stopTest();

    System.assertEquals(
      2,
      results.size(),
      'Should return logs for the department, still excluding the inactive project'
    );
  }

  @isTest
  static void testFetchFilteredRecords_ByDateRange() {
    TimeTrackingLogController.FiltersWrapper filters = new TimeTrackingLogController.FiltersWrapper();
    filters.startDate = String.valueOf(Date.today().addDays(-1));
    filters.endDate = String.valueOf(Date.today());
    String jsonFilters = JSON.serialize(filters);

    Test.startTest();
    List<TimeTrackingLog__c> results = TimeTrackingLogController.fetchFilteredRecords(
      jsonFilters
    );
    Test.stopTest();

    System.assertEquals(
      1,
      results.size(),
      'Should return only the log that falls within the date range'
    );
    System.assertEquals(Date.today(), results[0].Date__c);
  }

  @isTest
  static void testFetchFilteredRecords_AllFiltersCombined() {
    Project__c project = [
      SELECT Id
      FROM Project__c
      WHERE ShortName__c = 'Test Project'
      LIMIT 1
    ];

    TimeTrackingLogController.FiltersWrapper filters = new TimeTrackingLogController.FiltersWrapper();
    filters.projectId = project.Id;
    filters.collaboratorId = 'John Doe';
    filters.department = 'IT';
    filters.startDate = String.valueOf(Date.today().addDays(-10));
    filters.endDate = String.valueOf(Date.today());
    String jsonFilters = JSON.serialize(filters);

    Test.startTest();
    List<TimeTrackingLog__c> results = TimeTrackingLogController.fetchFilteredRecords(
      jsonFilters
    );
    Test.stopTest();

    System.assertEquals(
      2,
      results.size(),
      'Should return logs matching all combined filters'
    );
  }

  @isTest
  static void testFetchFilteredRecords_NoMatches_ReturnsEmptyList() {
    TimeTrackingLogController.FiltersWrapper filters = new TimeTrackingLogController.FiltersWrapper();
    filters.department = 'NonExistentDepartment';
    String jsonFilters = JSON.serialize(filters);

    Test.startTest();
    List<TimeTrackingLog__c> results = TimeTrackingLogController.fetchFilteredRecords(
      jsonFilters
    );
    Test.stopTest();

    System.assertEquals(
      0,
      results.size(),
      'Should return an empty list when no records match'
    );
  }

  @isTest
  static void testFetchFilteredRecords_InvalidJson_ThrowsAuraHandledException() {
    String invalidJson = '{ this is not valid json ';
    Boolean exceptionThrown = false;

    Test.startTest();
    try {
      TimeTrackingLogController.fetchFilteredRecords(invalidJson);
    } catch (AuraHandledException e) {
      exceptionThrown = true;
    }
    Test.stopTest();

    System.assert(
      exceptionThrown,
      'An AuraHandledException should be thrown for malformed JSON input'
    );
  }

  @isTest
  static void testGetAllProjects() {
    Test.startTest();
    List<Project__c> results = TimeTrackingLogController.getAllProjects();
    Test.stopTest();

    System.assertEquals(
      2,
      results.size(),
      'Should return every project regardless of Active__c status'
    );
  }
}
