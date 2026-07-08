import { LightningElement, track, api } from 'lwc';

export default class Summary extends LightningElement {

    summaryData = {};

    @api reloadSummary(data) {
        this.summaryData = data;
    }
}