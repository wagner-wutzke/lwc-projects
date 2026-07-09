import { LightningElement, api } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";

import NAME_FIELD from "@salesforce/schema/TimeTrackingLog__c.Name";
import ACTIVE_FIELD from "@salesforce/schema/TimeTrackingLog__c.Active__c";
import COLLABORATOR_FIELD from "@salesforce/schema/TimeTrackingLog__c.Collaborator__c";
import DATE_FIELD from "@salesforce/schema/TimeTrackingLog__c.Date__c";
import STARTTIME_FIELD from "@salesforce/schema/TimeTrackingLog__c.StartTime__c";
import ENDTIME_FIELD from "@salesforce/schema/TimeTrackingLog__c.EndTime__c";
import PROJECT_FIELD from "@salesforce/schema/TimeTrackingLog__c.Project__c";
import DESCRIPTION_FIELD from "@salesforce/schema/TimeTrackingLog__c.TaskDescription__c";
import TOTALTIME_FIELD from "@salesforce/schema/TimeTrackingLog__c.TotalTime__c";

import { deleteRecord } from "lightning/uiRecordApi";

export default class Details extends LightningElement {
    FIELDS = [
        NAME_FIELD,
        PROJECT_FIELD,
        COLLABORATOR_FIELD,
        DATE_FIELD,
        STARTTIME_FIELD,
        ENDTIME_FIELD,
        ACTIVE_FIELD,
        DESCRIPTION_FIELD,
        TOTALTIME_FIELD
    ];

    @api recordId;

    mode = "readonly";

    isDeleteDisabled = true;

    handleLoad() {
        const editForm = this.template.querySelector("lightning-record-form");
        if (this.recordId !== undefined && editForm.recordId !== undefined) {
            this.mode = "view";
            this.isDeleteDisabled = false;
        }
    }

    reset() {
        const editForm = this.template.querySelector("lightning-record-form");
        editForm.recordId = undefined;
        this.isDeleteDisabled = true;
    }

    handleNew() {
        this.reset();
        this.isDeleteDisabled = true;
        this.mode = "edit";
    }

    handleDelete() {
        deleteRecord(this.recordId)
            .then(() => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: "Success",
                        message: "Record deleted successfully",
                        variant: "success"
                    })
                );
                this.reset();
                this.reloadList();
            })
            .catch((error) => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: "Error deleting record",
                        message: error.body.message,
                        variant: "error"
                    })
                );
            });
        this.mode = "readonly";
        this.isDeleteDisabled = true;
    }

    handleCancel() {
        this.mode = "view";
        this.isDeleteDisabled = true;
    }

    handleSuccess() {
        this.mode = "readonly";
        this.reset();
        this.isDeleteDisabled = true;

        const evt = new ShowToastEvent({
            title: "Success",
            message: "Record saving successfully",
            variant: "success"
        });
        this.dispatchEvent(evt);
        this.reloadList();
    }

    reloadList() {
        const reloadListEvent = new CustomEvent("reloadlist", {
            detail: "reloadlist",
            bubbles: true
        });
        this.dispatchEvent(reloadListEvent);
    }
}
