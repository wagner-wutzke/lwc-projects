import { createElement } from "@lwc/engine-dom";
import Details from "c/details";
import { deleteRecord } from "lightning/uiRecordApi";

jest.mock(
  "lightning/uiRecordApi",
  () => ({
    deleteRecord: jest.fn().mockResolvedValue()
  }),
  { virtual: true }
);

describe("c-details", () => {
  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
    jest.clearAllMocks();
  });

  async function createComponent(recordId) {
    const element = createElement("c-details", { is: Details });
    if (recordId !== undefined) {
      element.recordId = recordId;
    }
    document.body.appendChild(element);
    await Promise.resolve();
    return element;
  }

  // * * * Rendering * * *

  it("renders a lightning-card with title Details", async () => {
    const element = await createComponent();

    const card = element.shadowRoot.querySelector("lightning-card");
    expect(card).not.toBeNull();
    expect(card.title).toBe("Details");
  });

  it("renders a lightning-record-form", async () => {
    const element = await createComponent();

    const form = element.shadowRoot.querySelector("lightning-record-form");
    expect(form).not.toBeNull();
  });

  it("renders New and Delete buttons", async () => {
    const element = await createComponent();

    const buttons = element.shadowRoot.querySelectorAll("lightning-button");
    const labels = Array.from(buttons).map((b) => b.label);
    expect(labels).toContain("New");
    expect(labels).toContain("Delete");
  });

  it("renders the record form with the correct object API name", async () => {
    const element = await createComponent();

    const form = element.shadowRoot.querySelector("lightning-record-form");
    expect(form.objectApiName).toBe("TimeTrackingLog__c");
  });

  // * * * Initial state * * *

  it("Delete button is disabled on initial render", async () => {
    const element = await createComponent();

    const deleteButton = Array.from(
      element.shadowRoot.querySelectorAll("lightning-button")
    ).find((b) => b.label === "Delete");
    expect(deleteButton.disabled).toBe(true);
  });

  it("record form starts in readonly mode", async () => {
    const element = await createComponent();

    const form = element.shadowRoot.querySelector("lightning-record-form");
    expect(form.mode).toBe("readonly");
  });

  // * * * handleNew * * *

  it("handleNew sets form mode to edit and clears recordId", async () => {
    const element = await createComponent("rec-001");

    const newButton = Array.from(
      element.shadowRoot.querySelectorAll("lightning-button")
    ).find((b) => b.label === "New");
    newButton.click();
    await Promise.resolve();

    const form = element.shadowRoot.querySelector("lightning-record-form");
    expect(form.mode).toBe("edit");
    expect(form.recordId).toBeUndefined();
  });

  it("handleNew disables Delete button", async () => {
    const element = await createComponent("rec-001");

    // Simulate a load that enables delete
    const form = element.shadowRoot.querySelector("lightning-record-form");
    form.dispatchEvent(new CustomEvent("load"));
    await Promise.resolve();

    const newButton = Array.from(
      element.shadowRoot.querySelectorAll("lightning-button")
    ).find((b) => b.label === "New");
    newButton.click();
    await Promise.resolve();

    const deleteButton = Array.from(
      element.shadowRoot.querySelectorAll("lightning-button")
    ).find((b) => b.label === "Delete");
    expect(deleteButton.disabled).toBe(true);
  });

  // * * * handleLoad * * *

  it("handleLoad enables Delete button when recordId is set on both element and form", async () => {
    const element = await createComponent("rec-001");

    const form = element.shadowRoot.querySelector("lightning-record-form");
    form.recordId = "rec-001";
    form.dispatchEvent(new CustomEvent("load"));
    await Promise.resolve();

    const deleteButton = Array.from(
      element.shadowRoot.querySelectorAll("lightning-button")
    ).find((b) => b.label === "Delete");
    expect(deleteButton.disabled).toBe(false);
  });

  it("handleLoad sets form mode to view when recordId is set", async () => {
    const element = await createComponent("rec-001");

    const form = element.shadowRoot.querySelector("lightning-record-form");
    form.recordId = "rec-001";
    form.dispatchEvent(new CustomEvent("load"));
    await Promise.resolve();

    expect(form.mode).toBe("view");
  });

  // * * * handleCancel * * *

  it("handleCancel sets mode back to view and disables Delete", async () => {
    const element = await createComponent("rec-001");

    // Enter edit via New
    const newButton = Array.from(
      element.shadowRoot.querySelectorAll("lightning-button")
    ).find((b) => b.label === "New");
    newButton.click();
    await Promise.resolve();

    // Cancel
    const form = element.shadowRoot.querySelector("lightning-record-form");
    form.dispatchEvent(new CustomEvent("cancel"));
    await Promise.resolve();

    expect(form.mode).toBe("view");
    const deleteButton = Array.from(
      element.shadowRoot.querySelectorAll("lightning-button")
    ).find((b) => b.label === "Delete");
    expect(deleteButton.disabled).toBe(true);
  });

  // * * * handleSuccess * * *

  it("handleSuccess resets the form and dispatches reloadlist", async () => {
    const element = await createComponent("rec-001");
    const reloadHandler = jest.fn();
    element.addEventListener("reloadlist", reloadHandler);

    const form = element.shadowRoot.querySelector("lightning-record-form");
    form.dispatchEvent(new CustomEvent("success"));
    await Promise.resolve();

    expect(reloadHandler).toHaveBeenCalledTimes(1);
    expect(form.recordId).toBeUndefined();
    expect(form.mode).toBe("readonly");
  });

  it("handleSuccess disables the Delete button", async () => {
    const element = await createComponent("rec-001");

    const form = element.shadowRoot.querySelector("lightning-record-form");
    form.recordId = "rec-001";
    form.dispatchEvent(new CustomEvent("load"));
    await Promise.resolve();

    form.dispatchEvent(new CustomEvent("success"));
    await Promise.resolve();

    const deleteButton = Array.from(
      element.shadowRoot.querySelectorAll("lightning-button")
    ).find((b) => b.label === "Delete");
    expect(deleteButton.disabled).toBe(true);
  });

  // * * * handleDelete * * *

  it("handleDelete calls deleteRecord with the current recordId", async () => {
    const element = await createComponent("rec-001");

    const deleteButton = Array.from(
      element.shadowRoot.querySelectorAll("lightning-button")
    ).find((b) => b.label === "Delete");
    deleteButton.click();
    await Promise.resolve();

    expect(deleteRecord).toHaveBeenCalledTimes(1);
    expect(deleteRecord).toHaveBeenCalledWith("rec-001");
  });

  it("handleDelete dispatches reloadlist on success", async () => {
    const element = await createComponent("rec-001");
    const reloadHandler = jest.fn();
    element.addEventListener("reloadlist", reloadHandler);

    const deleteButton = Array.from(
      element.shadowRoot.querySelectorAll("lightning-button")
    ).find((b) => b.label === "Delete");
    deleteButton.click();
    await Promise.resolve();

    expect(reloadHandler).toHaveBeenCalledTimes(1);
  });

  it("handleDelete sets mode to readonly and disables Delete button", async () => {
    const element = await createComponent("rec-001");

    const deleteButton = Array.from(
      element.shadowRoot.querySelectorAll("lightning-button")
    ).find((b) => b.label === "Delete");
    deleteButton.click();
    await Promise.resolve();

    const form = element.shadowRoot.querySelector("lightning-record-form");
    expect(form.mode).toBe("readonly");
    expect(deleteButton.disabled).toBe(true);
  });
});
