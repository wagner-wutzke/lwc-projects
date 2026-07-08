import { createElement } from "@lwc/engine-dom";
import Main from "c/main";

describe("c-main", () => {
  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  async function createComponent() {
    const element = createElement("c-main", { is: Main });
    document.body.appendChild(element);
    await Promise.resolve();
    return element;
  }

  // * * *  Rendering * * *

  it("renders all child components", async () => {
    const element = await createComponent();
    expect(element.shadowRoot.querySelector("c-filter")).not.toBeNull();
    expect(element.shadowRoot.querySelector("c-list")).not.toBeNull();
    expect(element.shadowRoot.querySelector("c-details")).not.toBeNull();
    expect(element.shadowRoot.querySelector("c-summary")).not.toBeNull();
  });

  // * * *  handleProjectChange * * *

  it("handleProjectChange updates filters and reloads the list", async () => {
    const element = await createComponent();
    const list = element.shadowRoot.querySelector("c-list");
    list.fetchTimeTrackingRecords = jest.fn();

    const filter = element.shadowRoot.querySelector("c-filter");
    filter.dispatchEvent(
      new CustomEvent("projectchange", {
        detail: { projectId: "proj-1", projectName: "Project One" }
      })
    );
    await Promise.resolve();

    expect(list.fetchTimeTrackingRecords).toHaveBeenCalledTimes(1);
    const calledFilters = list.fetchTimeTrackingRecords.mock.calls[0][0];
    expect(calledFilters.projectId).toBe("proj-1");
    expect(calledFilters.projectName).toBe("Project One");
  });

  // * * *  handleStartDateChange * * *

  it("handleStartDateChange updates startDate and reloads the list", async () => {
    const element = await createComponent();
    const list = element.shadowRoot.querySelector("c-list");
    list.fetchTimeTrackingRecords = jest.fn();

    const filter = element.shadowRoot.querySelector("c-filter");
    filter.dispatchEvent(
      new CustomEvent("startdatechange", { detail: "2026-01-01" })
    );
    await Promise.resolve();

    expect(list.fetchTimeTrackingRecords).toHaveBeenCalledTimes(1);
    const calledFilters = list.fetchTimeTrackingRecords.mock.calls[0][0];
    expect(calledFilters.startDate).toBe("2026-01-01");
  });

  // * * *  handleEndDateChange * * *

  it("handleEndDateChange updates endDate and reloads the list", async () => {
    const element = await createComponent();
    const list = element.shadowRoot.querySelector("c-list");
    list.fetchTimeTrackingRecords = jest.fn();

    const filter = element.shadowRoot.querySelector("c-filter");
    filter.dispatchEvent(
      new CustomEvent("enddatechange", { detail: "2026-12-31" })
    );
    await Promise.resolve();

    expect(list.fetchTimeTrackingRecords).toHaveBeenCalledTimes(1);
    const calledFilters = list.fetchTimeTrackingRecords.mock.calls[0][0];
    expect(calledFilters.endDate).toBe("2026-12-31");
  });

  // * * *  handleRowSelectionChange * * *

  it("handleRowSelectionChange stores the selected id and calls details.loadDetails", async () => {
    const element = await createComponent();
    const details = element.shadowRoot.querySelector("c-details");
    details.loadDetails = jest.fn();

    const list = element.shadowRoot.querySelector("c-list");
    list.dispatchEvent(
      new CustomEvent("rowselectionchange", { detail: "rec-42" })
    );
    await Promise.resolve();

    expect(details.loadDetails).toHaveBeenCalledTimes(1);
    expect(details.loadDetails).toHaveBeenCalledWith("rec-42");
  });

  it("handleRowSelectionChange does not throw when details has no loadDetails", async () => {
    const element = await createComponent();
    const list = element.shadowRoot.querySelector("c-list");

    expect(() => {
      list.dispatchEvent(
        new CustomEvent("rowselectionchange", { detail: "rec-99" })
      );
    }).not.toThrow();
  });

  // * * *  handleReloadSummary * * *

  it("handleReloadSummary passes event detail to summary.reloadSummary", async () => {
    const element = await createComponent();
    const summary = element.shadowRoot.querySelector("c-summary");
    summary.reloadSummary = jest.fn();

    const summaryData = { amountRecords: 5, amountHours: 10 };
    const list = element.shadowRoot.querySelector("c-list");
    list.dispatchEvent(
      new CustomEvent("reloadsummary", { detail: summaryData })
    );
    await Promise.resolve();

    expect(summary.reloadSummary).toHaveBeenCalledTimes(1);
    expect(summary.reloadSummary).toHaveBeenCalledWith(summaryData);
  });

  it("handleReloadSummary does not throw when summary has no reloadSummary", async () => {
    const element = await createComponent();
    const list = element.shadowRoot.querySelector("c-list");

    expect(() => {
      list.dispatchEvent(new CustomEvent("reloadsummary", { detail: {} }));
    }).not.toThrow();
  });

  // * * * handleReloadList * * *

  it("handleReloadList triggers list.fetchTimeTrackingRecords with current filters", async () => {
    const element = await createComponent();
    const list = element.shadowRoot.querySelector("c-list");
    list.fetchTimeTrackingRecords = jest.fn();

    const details = element.shadowRoot.querySelector("c-details");
    details.dispatchEvent(new CustomEvent("reloadlist"));
    await Promise.resolve();

    expect(list.fetchTimeTrackingRecords).toHaveBeenCalledTimes(1);
  });

  it("handleReloadList passes the current filters to the list", async () => {
    const element = await createComponent();
    const list = element.shadowRoot.querySelector("c-list");
    list.fetchTimeTrackingRecords = jest.fn();

    // Change a filter first
    const filter = element.shadowRoot.querySelector("c-filter");
    filter.dispatchEvent(
      new CustomEvent("projectchange", {
        detail: { projectId: "proj-x", projectName: "X" }
      })
    );
    await Promise.resolve();
    list.fetchTimeTrackingRecords.mockClear();

    // Now trigger reload from details
    const details = element.shadowRoot.querySelector("c-details");
    details.dispatchEvent(new CustomEvent("reloadlist"));
    await Promise.resolve();

    expect(list.fetchTimeTrackingRecords).toHaveBeenCalledTimes(1);
    const calledFilters = list.fetchTimeTrackingRecords.mock.calls[0][0];
    expect(calledFilters.projectId).toBe("proj-x");
  });

  it("handleReloadList does not throw when list has no fetchTimeTrackingRecords", async () => {
    const element = await createComponent();
    const details = element.shadowRoot.querySelector("c-details");

    expect(() => {
      details.dispatchEvent(new CustomEvent("reloadlist"));
    }).not.toThrow();
  });
});
