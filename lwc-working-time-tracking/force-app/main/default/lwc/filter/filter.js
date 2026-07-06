import { LightningElement, wire } from "lwc";
import getAllProjectsForFilter from "@salesforce/apex/TimeTrackingLogController.getAllProjectsForFilter";

export default class Filter extends LightningElement {
  allProjects = undefined;
  startDateFilter = undefined;
  endDateFilter = undefined;
  selectedProjectId = "All";

  @wire(getAllProjectsForFilter)
  wiredProjectRecords({ error, data }) {
    if (data) {
      this.generateProjectFilterOptions(data);
    } else if (error) {
      console.error("Error loading project records", error);
    }
  }

  generateProjectFilterOptions(data) {
    // Build options array with a default "All" option
    this.allProjects = [
      { label: "All", value: "All" },
      ...Array.from(data).map((project) => ({
        label: project.Name,
        value: project.Id
      }))
    ];
  }

  handleProjectChange(event) {
    this.selectedProjectId = event.detail.value;
    const projectChangeEvent = new CustomEvent("projectchange", {
      detail: { projectId: this.selectedProjectId }
    });
    this.dispatchEvent(projectChangeEvent, { bubbles: true, composed: true });
  }

  handleStartDateChange(event) {
    this.startDateFilter = event.detail.value;
    const startDateChangeEvent = new CustomEvent("startdatechange", {
      detail: { startDate: this.startDateFilter }
    });
    this.dispatchEvent(startDateChangeEvent, { bubbles: true, composed: true });
  }

  handleEndDateChange(event) {
    this.endDateFilter = event.detail.value;
    const endDateChangeEvent = new CustomEvent("enddatechange", {
      detail: { endDate: this.endDateFilter }
    });
    this.dispatchEvent(endDateChangeEvent, { bubbles: true, composed: true });
  }
}
