import { createElement } from "@lwc/engine-dom";
import List from "c/list";
import fetchFilteredRecords from "@salesforce/apex/TimeTrackingLogController.fetchFilteredRecords";

jest.mock(
    "@salesforce/apex/TimeTrackingLogController.fetchFilteredRecords",
    () => ({ __esModule: true, default: jest.fn() }),
    { virtual: true }
);

const MOCK_FILTERS = {
    projectId: "proj-001",
    projectName: "Alpha",
    collaboratorId: "",
    collaboratorName: "",
    department: "",
    startDate: "2026-01-01",
    endDate: "2026-01-31"
};

const MOCK_RECORDS = [
    {
        Id: "rec-001",
        Name: "TT-001",
        Date__c: "2026-01-10",
        StartTime__c: "2026-01-10T08:00:00Z",
        EndTime__c: "2026-01-10T10:00:00Z",
        TotalTime__c: 2,
        TaskDescription__c: "Design work",
        Project__r: {
            Name: "Alpha",
            Department__c: "Engineering",
            CostCenter__c: "CC-01",
            ProjectOwner__r: { Name: "Alice" }
        },
        Collaborator__r: { Name: "Bob" }
    },
    {
        Id: "rec-002",
        Name: "TT-002",
        Date__c: "2026-01-11",
        StartTime__c: "2026-01-11T09:00:00Z",
        EndTime__c: "2026-01-11T11:30:00Z",
        TotalTime__c: 2.5,
        TaskDescription__c: "Development",
        Project__r: {
            Name: "Alpha",
            Department__c: "Engineering",
            CostCenter__c: "CC-01",
            ProjectOwner__r: { Name: "Alice" }
        },
        Collaborator__r: { Name: "Carol" }
    }
];

describe("c-list", () => {
    afterEach(() => {
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
        jest.clearAllMocks();
    });

    async function createComponent() {
        const element = createElement("c-list", { is: List });
        document.body.appendChild(element);
        await Promise.resolve();
        return element;
    }

    async function createComponentWithRecords(records = MOCK_RECORDS) {
        fetchFilteredRecords.mockResolvedValue(records);
        const element = await createComponent();
        await element.fetchTimeTrackingRecords(MOCK_FILTERS);
        await Promise.resolve();
        return element;
    }

    // * * * Rendering * * *

    it("renders a lightning-card with title Working Hours", async () => {
        const element = await createComponent();

        const card = element.shadowRoot.querySelector("lightning-card");
        expect(card).not.toBeNull();
        expect(card.title).toBe("Working Hours");
    });

    it("shows the empty-state paragraph when no records are loaded", async () => {
        const element = await createComponent();

        const emptyMsg = element.shadowRoot.querySelector("p");
        expect(emptyMsg).not.toBeNull();
        expect(emptyMsg.textContent).toBe("No Time Tracking records available.");
    });

    it("hides the empty-state paragraph after records are loaded", async () => {
        const element = await createComponentWithRecords();

        const emptyMsg = element.shadowRoot.querySelector("p");
        expect(emptyMsg).toBeNull();
    });

    it("renders a lightning-datatable after records are loaded", async () => {
        const element = await createComponentWithRecords();

        const table = element.shadowRoot.querySelector("lightning-datatable");
        expect(table).not.toBeNull();
    });

    // * * * fetchTimeTrackingRecords * * *

    it("fetchTimeTrackingRecords calls the Apex method with correct jsonFilters", async () => {
        fetchFilteredRecords.mockResolvedValue([]);
        const element = await createComponent();

        await element.fetchTimeTrackingRecords(MOCK_FILTERS);
        await Promise.resolve();

        expect(fetchFilteredRecords).toHaveBeenCalledTimes(1);
        expect(fetchFilteredRecords).toHaveBeenCalledWith({
            jsonFilters: JSON.stringify(MOCK_FILTERS)
        });
    });

    it("fetchTimeTrackingRecords maps raw Apex data to flat table rows", async () => {
        const element = await createComponentWithRecords();

        const table = element.shadowRoot.querySelector("lightning-datatable");
        expect(table.data).toHaveLength(2);

        const row = table.data[0];
        expect(row.Id).toBe("rec-001");
        expect(row.Name).toBe("TT-001");
        expect(row.Project).toBe("Alpha");
        expect(row.Department).toBe("Engineering");
        expect(row.Collaborator).toBe("Bob");
        expect(row.TotalTime).toBe(2);
        expect(row.TaskDescription).toBe("Design work");
        expect(row.CostCenter).toBe("CC-01");
    });

    it("fetchTimeTrackingRecords dispatches reloadsummary with correct totals", async () => {
        fetchFilteredRecords.mockResolvedValue(MOCK_RECORDS);
        const element = await createComponent();
        const summaryHandler = jest.fn();
        element.addEventListener("reloadsummary", summaryHandler);

        await element.fetchTimeTrackingRecords(MOCK_FILTERS);
        await Promise.resolve();

        expect(summaryHandler).toHaveBeenCalledTimes(1);
        const detail = summaryHandler.mock.calls[0][0].detail;
        expect(detail.amountRecords).toBe(2);
        expect(parseFloat(detail.amountHours)).toBeCloseTo(4.5);
        expect(detail.projectName).toBe("Alpha");
        expect(detail.startDate).toBe("2026-01-01");
        expect(detail.endDate).toBe("2026-01-31");
    });

    it("fetchTimeTrackingRecords dispatches reloadsummary with zero totals for empty data", async () => {
        fetchFilteredRecords.mockResolvedValue([]);
        const element = await createComponent();
        const summaryHandler = jest.fn();
        element.addEventListener("reloadsummary", summaryHandler);

        await element.fetchTimeTrackingRecords(MOCK_FILTERS);
        await Promise.resolve();

        const detail = summaryHandler.mock.calls[0][0].detail;
        expect(detail.amountRecords).toBe(0);
        expect(parseFloat(detail.amountHours)).toBe(0);
    });

    it("fetchTimeTrackingRecords does not crash on Apex error", async () => {
        fetchFilteredRecords.mockRejectedValue({ message: "Apex error" });
        const element = await createComponent();

        await expect(element.fetchTimeTrackingRecords(MOCK_FILTERS)).resolves.not.toThrow();
    });

    // * * * handleRowSelection * * *

    it("handleRowSelection dispatches rowselectionchange with the selected row Id", async () => {
        const element = await createComponentWithRecords();
        const selectionHandler = jest.fn();
        element.addEventListener("rowselectionchange", selectionHandler);

        const table = element.shadowRoot.querySelector("lightning-datatable");
        table.dispatchEvent(
            new CustomEvent("rowselection", {
                detail: { selectedRows: [{ Id: "rec-001" }] }
            })
        );
        await Promise.resolve();

        expect(selectionHandler).toHaveBeenCalledTimes(1);
        expect(selectionHandler.mock.calls[0][0].detail).toBe("rec-001");
    });

    // * * * columns * * *

    it("passes the correct column definitions to lightning-datatable", async () => {
        const element = await createComponentWithRecords();

        const table = element.shadowRoot.querySelector("lightning-datatable");
        const fieldNames = table.columns.map((c) => c.fieldName);
        expect(fieldNames).toContain("Name");
        expect(fieldNames).toContain("Collaborator");
        expect(fieldNames).toContain("Project");
        expect(fieldNames).toContain("TotalTime");
        expect(table.columns).toHaveLength(10);
    });
});
