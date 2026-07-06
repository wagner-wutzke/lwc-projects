import { LightningElement, api } from 'lwc';
import fetchRecordById from '@salesforce/apex/TimeTrackingLogController.findTimeTrackingLogById';

export default class Details extends LightningElement {

    @api
    async fetchTimeTrackingLogById(id) {
        console.log('Fetching TimeTrackingLog record by id: ' + id);
        fetchRecordById({ timeTrackingLogId: id })
            .then((data) => {
                console.log('Retrieved data: ' + JSON.stringify(data));
                return data;
            })
            .catch((error) => {
                console.error("Error fetching record for id: " + id, JSON.stringify(error));
            });
    }
}