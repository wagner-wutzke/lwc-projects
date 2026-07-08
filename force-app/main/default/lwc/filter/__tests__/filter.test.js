import { createElement } from "@lwc/engine-dom";
import Filter from "c/filter";
import getAllProjectsForFilter from "@salesforce/apex/TimeTrackingLogController.getAllProjects";

jest.mock(
  "@salesforce/apex/TimeTrackingLogController.getAllProjects",
  () => {
    const { createApexTestWireAdapter } = require("@salesforce/sfdx-lwc-jest");
    const adapter = createApexTestWireAdapter(jest.fn());
    return { __esModule: true, default: adapter };
  },
  { virtual: true }
);

const mockGetAllProjects = getAllProjectsForFilter;

const MOCK_PROJECTS = [
  { Id: "proj-001", Name: "Alpha" },
  { Id: "proj-002", Name: "Beta" }
];

describe("c-filter", () => {
  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  async function createComponent() {
    const element = createElement("c-filter", { is: Filter });
    document.body.appendChild(element);
    await Promise.resolve();
    return element;
  }

  async function createComponentWithProjects(projects = MOCK_PROJECTS) {
    const element = await createComponent();
    mockGetAllProjects.emit(projects);
    await Promise.resolve();
    return element;
  }

  // * * * Rendering * * *

  it("renders a lightning-combobox for project selection", async () => {
    const element = await createComponent();

    const combobox = element.shadowRoot.querySelector("lightning-combobox");
    expect(combobox).not.toBeNull();
  });

  it("renders two lightning-input date fields", async () => {
    const element = await createComponent();

    const inputs = element.shadowRoot.querySelectorAll("lightning-input");
    expect(inputs).toHaveLength(2);
  });

  // * * * connectedCallback initial values * * *

  it("initialises startDateInitValue to the first day of the current year", async () => {
    const element = await createComponent();

    const startInput =
      element.shadowRoot.querySelectorAll("lightning-input")[0];
    const year = new Date().getFullYear();
    expect(startInput.value).toBe(`${year}-01-01`);
  });

  it("initialises endDateInitValue to the last day of the current month", async () => {
    const element = await createComponent();

    const endInput = element.shadowRoot.querySelectorAll("lightning-input")[1];
    const now = new Date();
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const expected = lastDay.toISOString().split("T")[0];
    expect(endInput.value).toBe(expected);
  });

  // * * * wire — project options * * *

  it("populates combobox options with an All option plus wired projects", async () => {
    const element = await createComponentWithProjects();

    const combobox = element.shadowRoot.querySelector("lightning-combobox");
    expect(combobox.options).toHaveLength(3);
    expect(combobox.options[0]).toEqual({ label: "All", value: "All" });
    expect(combobox.options[1]).toEqual({ label: "Alpha", value: "proj-001" });
    expect(combobox.options[2]).toEqual({ label: "Beta", value: "proj-002" });
  });

  it("does not crash when the wired projects returns an error", async () => {
    await createComponent();

    expect(() => mockGetAllProjects.emitError()).not.toThrow();
  });

  // * * * handleProjectChange * * *

  it("handleProjectChange dispatches projectchange event with id and name", async () => {
    const element = await createComponentWithProjects();

    const projectChangeHandler = jest.fn();
    element.addEventListener("projectchange", projectChangeHandler);

    const combobox = element.shadowRoot.querySelector("lightning-combobox");
    combobox.dispatchEvent(
      new CustomEvent("change", { detail: { value: "proj-001" } })
    );
    await Promise.resolve();

    expect(projectChangeHandler).toHaveBeenCalledTimes(1);
    const detail = projectChangeHandler.mock.calls[0][0].detail;
    expect(detail.projectId).toBe("proj-001");
    expect(detail.projectName).toBe("Alpha");
  });

  it("handleProjectChange uses empty string for projectName when option is not found", async () => {
    const element = await createComponentWithProjects();

    const projectChangeHandler = jest.fn();
    element.addEventListener("projectchange", projectChangeHandler);

    const combobox = element.shadowRoot.querySelector("lightning-combobox");
    combobox.dispatchEvent(
      new CustomEvent("change", { detail: { value: "proj-unknown" } })
    );
    await Promise.resolve();

    const detail = projectChangeHandler.mock.calls[0][0].detail;
    expect(detail.projectId).toBe("proj-unknown");
    expect(detail.projectName).toBe("");
  });

  it("handleProjectChange dispatches the All option correctly", async () => {
    const element = await createComponentWithProjects();

    const projectChangeHandler = jest.fn();
    element.addEventListener("projectchange", projectChangeHandler);

    const combobox = element.shadowRoot.querySelector("lightning-combobox");
    combobox.dispatchEvent(
      new CustomEvent("change", { detail: { value: "All" } })
    );
    await Promise.resolve();

    const detail = projectChangeHandler.mock.calls[0][0].detail;
    expect(detail.projectId).toBe("All");
    expect(detail.projectName).toBe("All");
  });

  // * * * handleStartDateChange * * *

  it("handleStartDateChange dispatches startdatechange with the selected date", async () => {
    const element = await createComponent();

    const startDateHandler = jest.fn();
    element.addEventListener("startdatechange", startDateHandler);

    const startInput =
      element.shadowRoot.querySelectorAll("lightning-input")[0];
    startInput.dispatchEvent(
      new CustomEvent("change", { detail: { value: "2026-03-01" } })
    );
    await Promise.resolve();

    expect(startDateHandler).toHaveBeenCalledTimes(1);
    expect(startDateHandler.mock.calls[0][0].detail).toBe("2026-03-01");
  });

  // * * * handleEndDateChange * * *

  it("handleEndDateChange dispatches enddatechange with the selected date", async () => {
    const element = await createComponent();

    const endDateHandler = jest.fn();
    element.addEventListener("enddatechange", endDateHandler);

    const endInput = element.shadowRoot.querySelectorAll("lightning-input")[1];
    endInput.dispatchEvent(
      new CustomEvent("change", { detail: { value: "2026-03-31" } })
    );
    await Promise.resolve();

    expect(endDateHandler).toHaveBeenCalledTimes(1);
    expect(endDateHandler.mock.calls[0][0].detail).toBe("2026-03-31");
  });
});
