import { LightningElement, wire } from "lwc";
import getAllRecords from "@salesforce/apex/TimeTrackingLogController.getAllRecords";

const COLUMNS = [
  { label: "Name", fieldName: "Name", type: "text" },
  { label: "Collaborator", fieldName: "Collaborator", type: "text" },
  { label: "Project", fieldName: "Project", type: "text" },
  { label: "Department", fieldName: "Department", type: "text" },
  {
    label: "Date",
    fieldName: "Date",
    type: "date",
    typeAttributes: { day: "2-digit", month: "2-digit", year: "numeric" }
  },
  {
    label: "Start Time",
    fieldName: "StartTime",
    type: "date",
    typeAttributes: {
      hour: "2-digit",
      minute: "2-digit"
    }
  },
  {
    label: "End Time",
    fieldName: "EndTime",
    type: "date",
    typeAttributes: {
      hour: "2-digit",
      minute: "2-digit"
    }
  },
  { label: "Task Description", fieldName: "TaskDescription", type: "text" },
  { label: "Cost Center", fieldName: "CostCenter", type: "text" }
];

export default class List extends LightningElement {
  columns = COLUMNS;
  timeTrackingRecords = undefined;

  //@wire(getAllRecords, { annualRevenue: '$annualRevenue' })
  @wire(getAllRecords)
  wiredRecords({ error, data }) {
    if (data) {
      let fixeddata = [];
      data.forEach((row) => {
        let dataline = {};
        dataline.Id = row.Id;
        dataline.Name = row.Name;
        dataline.Project = row.Project__r.Name;
        dataline.Department = row.Project__r.Department__c;
        dataline.Date = row.Date__c;
        dataline.StartTime = row.StartTime__c;
        dataline.EndTime = row.EndTime__c;
        dataline.TaskDescription = row.TaskDescription__c;
        dataline.CostCenter = row.Project__r.CostCenter__c;
        dataline.Collaborator = row.Collaborator__r.Name;
        dataline.ProjectOwner = row.Project__r.ProjectOwner__r.Name;
        fixeddata.push(dataline);
      });
      this.timeTrackingRecords = fixeddata;
    } else if (error) {
      console.error("Error fetching records:", error);
    }
  }
}
