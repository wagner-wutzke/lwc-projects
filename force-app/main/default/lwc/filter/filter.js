import { LightningElement, wire } from "lwc";
import getAllProjectsForFilter from "@salesforce/apex/TimeTrackingLogController.getAllProjects";

export default class Filter extends LightningElement {
  allProjects = undefined;

  startDateInitValue;
  endDateInitValue;
  selectedProjectId;

  connectedCallback() {
    const now = new Date();
    this.startDateInitValue = new Date(now.getFullYear(), 0 /*now.getMonth()*/, 1).toISOString().split('T')[0];
    this.endDateInitValue = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
    this.selectedProjectId = '';
  }

  @wire(getAllProjectsForFilter)
  wiredProjectRecords({ error, data }) {
    if (data) {
      this.generateProjectFilterOptions(data);
    } else if (error) {
      console.error("Error loading project records: ", error);
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
    const selectedProjectId = event.detail.value;
    const selectedOption = this.allProjects.find(option => option.value === selectedProjectId);
    const selectedProjectName = selectedOption ? selectedOption.label : "";
    const projectChangeEvent = new CustomEvent("projectchange", {
      detail: { projectId: selectedProjectId, projectName: selectedProjectName },
      bubbles: true
    });
    this.dispatchEvent(projectChangeEvent);
  }

  handleStartDateChange(event) {
    const startDate = event.detail.value;
    const startDateChangeEvent = new CustomEvent("startdatechange", {
      detail: startDate,
      bubbles: true
    });
    this.dispatchEvent(startDateChangeEvent);
  }

  handleEndDateChange(event) {
    const endDate = event.detail.value;
    const endDateChangeEvent = new CustomEvent("enddatechange", {
      detail: endDate,
      bubbles: true
    });
    this.dispatchEvent(endDateChangeEvent);
  }
}
