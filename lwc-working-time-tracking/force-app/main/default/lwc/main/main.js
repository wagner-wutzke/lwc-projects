import { LightningElement } from "lwc";
// import Toast from "lightning/toast";

export default class Main extends LightningElement {
  filters = {
    projectId: "",
    collaboratorId: "",
    department: "",
    startDate: "",
    endDate: "",
  };

  async handleProjectChange(event) {
    const filterValue = event.detail;
    this.filters = { ...this.filters,  projectId: filterValue };
    this.executeAction();
  }

  async handleStartDateChange(event) {
    const filterValue = event.detail;
    this.filters = { ...this.filters, startDate: filterValue };
    this.executeAction();
  }

  async handleEndDateChange(event) {
    const filterValue = event.detail;
    this.filters = { ...this.filters, endDate: filterValue };
    this.executeAction();
  }

  executeAction() {
    const list = this.template.querySelector("c-list");
    if (list && typeof list.fetchTimeTrackingRecords === "function") {
      list.fetchTimeTrackingRecords(this.filters);
    }
  }
}
