import { api, LightningElement } from "lwc";

export default class Main extends LightningElement {
  @api filters = {
    collaborator: "",
    project: "",
    department: "",
    startDate: "",
    endDate: ""
  };
}
