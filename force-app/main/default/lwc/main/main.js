import { LightningElement, track } from "lwc";

export default class Main extends LightningElement {
  
  now = new Date();
  
  @track filters = {
    projectId: "",
    projectName: "",
    collaboratorId: "",
    collaboratorName: "",
    department: "",
    startDate: new Date(this.now.getFullYear(), 1 /*now.getMonth()*/, 0).toISOString().split('T')[0],
    endDate: new Date(this.now.getFullYear(), this.now.getMonth() + 1, 0).toISOString().split('T')[0],
  };

  selectedTimeTrackingId;

  handleProjectChange(event) {
    this.filters = { 
      ...this.filters,  
      projectId: event.detail.projectId, 
      projectName: event.detail.projectName 
    };
    this.reloadList();
  }

  handleStartDateChange(event) {
    const filterValue = event.detail;
    this.filters = { ...this.filters, startDate: filterValue };
    this.reloadList();
  }

  handleEndDateChange(event) {
    const filterValue = event.detail;
    this.filters = { ...this.filters, endDate: filterValue };
    this.reloadList();
  }

  handleRowSelectionChange(event) {
    this.selectedTimeTrackingId = event.detail;
    const details = this.template.querySelector("c-details");
    if (details && typeof details.loadDetails === "function") {
      details.loadDetails(this.selectedTimeTrackingId);
    }
  }

  handleReloadSummary(event) {
    const summary = this.template.querySelector("c-summary");
    if (summary && typeof summary.reloadSummary === "function") {
      summary.reloadSummary(event.detail);
    }
  }

  handleReloadList(event) {
    this.reloadList();
  }

  reloadList() {
    const list = this.template.querySelector("c-list");
    if (list && typeof list.fetchTimeTrackingRecords === "function") {
      list.fetchTimeTrackingRecords(this.filters);
    }
  }

}
