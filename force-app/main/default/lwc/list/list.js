import { LightningElement, api, track } from "lwc";
import fetchFilteredRecords from "@salesforce/apex/TimeTrackingLogController.fetchFilteredRecords";
import { ShowToastEvent } from "lightning/platformShowToastEvent";

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
  {
    label: "Total Time",
    fieldName: "TotalTime",
    type: "number",
    typeAttributes: { minimumFractionDigits: 2 },
    cellAttributes: { alignment: "center" }
  },
  { label: "Task Description", fieldName: "TaskDescription", type: "text" },
  { label: "Cost Center", fieldName: "CostCenter", type: "text" }
];

export default class List extends LightningElement {
  columns = COLUMNS;

  @track timeTrackingRecords = undefined;

  summary = {
    amountRecords: 0,
    amountHours: 0,
    projectName: undefined,
    startDate: undefined,
    endDate: undefined
  };

  @api
  async fetchTimeTrackingRecords(filters) {
    const jsonFilters = JSON.stringify(filters);
    console.log("Fetching filtered data with filters:", jsonFilters);
    fetchFilteredRecords({ jsonFilters: jsonFilters })
      .then((data) => {
        this.timeTrackingRecords = this.buildRecords(data);
        this.buildSummary(filters, data);
        this.fireReloadSummaryEvent();
      })
      .catch((error) => {
        this.dispatchEvent(
          new ShowToastEvent({
            title: "Error fetching records",
            message:
              "Error fetching records with filters: " +
              jsonFilters +
              ". Error: " +
              error.message,
            variant: "error"
          })
        );
      });
  }

  buildRecords(data) {
    let fixedData = [];
    data.forEach((row) => {
      let dataline = {};
      dataline.Id = row.Id;
      dataline.Name = row.Name;
      dataline.Project = row.Project__r.Name;
      dataline.Department = row.Project__r.Department__c;
      dataline.Date = row.Date__c;
      dataline.StartTime = row.StartTime__c;
      dataline.EndTime = row.EndTime__c;
      dataline.TotalTime = row.TotalTime__c;
      dataline.TaskDescription = row.TaskDescription__c;
      dataline.CostCenter = row.Project__r.CostCenter__c;
      dataline.Collaborator = row.Collaborator__r.Name;
      dataline.ProjectOwner = row.Project__r.ProjectOwner__r.Name;
      fixedData.push(dataline);
    });
    return fixedData;
  }

  buildSummary(filters, data) {
    this.summary.projectName = filters.projectName;
    this.summary.projectId = filters.projectId;
    this.summary.startDate = filters.startDate;
    this.summary.endDate = filters.endDate;
    this.summary.amountRecords = 0;
    this.summary.amountHours = 0;

    data.forEach((row) => {
      this.summary.amountRecords++;
      this.summary.amountHours += row.TotalTime__c;
    });
    this.summary.amountHours = this.summary.amountHours.toFixed(2);
  }

  fireReloadSummaryEvent() {
    const summaryReloadEvent = new CustomEvent("reloadsummary", {
      detail: { ...this.summary },
      bubbles: true
    });
    this.dispatchEvent(summaryReloadEvent);
  }

  async handleRowSelection(event) {
    const selectedRowId = event.detail.selectedRows[0].Id;
    const rowSelectionChangeEvent = new CustomEvent("rowselectionchange", {
      detail: selectedRowId,
      bubbles: true
    });
    this.dispatchEvent(rowSelectionChangeEvent);
  }

  async handleReloadList(event) {
    this.fetchTimeTrackingRecords(event.details);
  }
}
