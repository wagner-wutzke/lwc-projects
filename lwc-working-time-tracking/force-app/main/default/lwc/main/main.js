import { LightningElement, api } from "lwc";

export default class Main extends LightningElement {
  filters = {
    projectId: "",
    collaboratorId: "",
    department: "",
    startDate: "",
    endDate: "",
  };

  selectedTimeTrackingId;

  async handleProjectChange(event) {
    const filterValue = event.detail;
    this.filters = { ...this.filters,  projectId: filterValue };
    this.reloadList();
  }

  async handleStartDateChange(event) {
    const filterValue = event.detail;
    this.filters = { ...this.filters, startDate: filterValue };
    this.reloadList();
  }

  async handleEndDateChange(event) {
    const filterValue = event.detail;
    this.filters = { ...this.filters, endDate: filterValue };
    this.reloadList();
  }

  async handleRowSelectionChange(event) {
    this.selectedTimeTrackingId = event.detail;
    const details = this.template.querySelector("c-details");
    if (details && typeof details.loadDetails === "function") {
      details.loadDetails(this.selectedTimeTrackingId);
    }
  }

  async handleReloadList(event) {
    this.reloadList();
  }

  reloadList() {
    const list = this.template.querySelector("c-list");
    if (list && typeof list.fetchTimeTrackingRecords === "function") {
      list.fetchTimeTrackingRecords(this.filters);
    }
  }

}
