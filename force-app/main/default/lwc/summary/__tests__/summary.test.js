import { createElement } from "@lwc/engine-dom";
import Summary from "c/summary";

// lightning-input order in template: [0] Project, [1] Start date, [2] End date, [3] Total Hours
const INPUT_PROJECT = 0;
const INPUT_START = 1;
const INPUT_END = 2;
const INPUT_HOURS = 3;

const DEFAULT_DATA = {
    projectName: "My Project",
    startDate: "2026-01-01",
    endDate: "2026-01-31",
    amountHours: 40
};

describe("c-summary", () => {
    afterEach(() => {
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
    });

    it("renders the lightning-card with title Summary", () => {
        const element = createElement("c-summary", { is: Summary });
        document.body.appendChild(element);

        const card = element.shadowRoot.querySelector("lightning-card");
        expect(card).not.toBeNull();
        expect(card.title).toBe("Summary");
    });

    it("renders all four lightning-input fields after reloadSummary is called", async () => {
        const element = createElement("c-summary", { is: Summary });
        document.body.appendChild(element);

        element.reloadSummary(DEFAULT_DATA);
        await Promise.resolve();

        const inputs = element.shadowRoot.querySelectorAll("lightning-input");
        expect(inputs).toHaveLength(4);
    });

    it("displays the correct projectName value", async () => {
        const element = createElement("c-summary", { is: Summary });
        document.body.appendChild(element);

        element.reloadSummary({ ...DEFAULT_DATA, projectName: "Time Tracking" });
        await Promise.resolve();

        const inputs = element.shadowRoot.querySelectorAll("lightning-input");
        expect(inputs[INPUT_PROJECT].value).toBe("Time Tracking");
    });

    it("displays the correct startDate value", async () => {
        const element = createElement("c-summary", { is: Summary });
        document.body.appendChild(element);

        element.reloadSummary({ ...DEFAULT_DATA, startDate: "2026-03-01" });
        await Promise.resolve();

        const inputs = element.shadowRoot.querySelectorAll("lightning-input");
        expect(inputs[INPUT_START].value).toBe("2026-03-01");
    });

    it("displays the correct endDate value", async () => {
        const element = createElement("c-summary", { is: Summary });
        document.body.appendChild(element);

        element.reloadSummary({ ...DEFAULT_DATA, endDate: "2026-03-31" });
        await Promise.resolve();

        const inputs = element.shadowRoot.querySelectorAll("lightning-input");
        expect(inputs[INPUT_END].value).toBe("2026-03-31");
    });

    it("displays the correct amountHours value", async () => {
        const element = createElement("c-summary", { is: Summary });
        document.body.appendChild(element);

        element.reloadSummary({ ...DEFAULT_DATA, amountHours: 120 });
        await Promise.resolve();

        const inputs = element.shadowRoot.querySelectorAll("lightning-input");
        expect(inputs[INPUT_HOURS].value).toBe(120);
    });

    it("updates displayed values when reloadSummary is called a second time", async () => {
        const element = createElement("c-summary", { is: Summary });
        document.body.appendChild(element);

        element.reloadSummary({
            projectName: "Project A",
            startDate: "2026-01-01",
            endDate: "2026-01-31",
            amountHours: 10
        });
        await Promise.resolve();

        element.reloadSummary({
            projectName: "Project B",
            startDate: "2026-02-01",
            endDate: "2026-02-28",
            amountHours: 25
        });
        await Promise.resolve();

        const inputs = element.shadowRoot.querySelectorAll("lightning-input");
        expect(inputs[INPUT_PROJECT].value).toBe("Project B");
        expect(inputs[INPUT_HOURS].value).toBe(25);
    });
});
