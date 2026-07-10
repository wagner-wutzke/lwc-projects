# LWC Time Tracking

<img width="1349" height="771" alt="Screenshot from 2026-07-10 16-09-41" src="https://github.com/user-attachments/assets/0606b0f5-090e-41ee-bd05-c71e21cce928" />

<p>&nbsp;</p>

This is a small portofolio project for showing LWC components intercommunication.
The application goal is to manage working hours related to projects.
It is build with LWC components. The components are building a compound as pictured below.

<p align="center">
  <img width="600" height="400" alt="image" src="https://github.com/user-attachments/assets/187ca37a-db15-4fe1-be34-56badb15ba51" />
</p>

## LWC Components

### Main
This is the parent component holding all other child components. 
It Receives events from them and handles them properly, passing results back, when necessary.

### Filter
This is a component for filtering the records to be shown according to the selectors:
- Project
- Start Date
- End Date
- Collaborator (not implemented yet)

Changing any filter selection fires a custom event, which is captured by the main component.\
The main component calls a method imperatively in the `list` component, causing a list reload.

### List
This is the component responsible to show all records available according to the selected filter parameters.\
When a record is selected, it gets loaded in the `details` component, where it can be edited or deleted.\
Additionally, when reloading, the list component fires a custom event for reloading the `summary` component with the new calculated values.\
The main component catches the event and calls a method imperatively in the `summary` component.

### Details
This is the component responsible for showing the selected record details.\
When clicking on the "New" button, a new record can be created. After creating or deleting a record, the `list` component gets updated.\
This component uses a standard `lightning-record-form`, which does not need any controller for saving or deleting the selected record.

### Summary
This is the component responsible for showing the amount of registered hours for the given filter selections.\
It shows the current filter selections and the total amount.

## Missing Features
- There is no validation for Dates filters: Start Date is allowed to be after the End Date.
- There is no validation for Times in the Time Tracking Log records: Start Time is allowed be after the End Time.
- Only an administrator or other dedicated user should have access to all users Time Tracking Log records.
- When opening the application, only Time Tracking Log records for the current user should be listed.
- When opening the application, only projects where the current user is involved should be listed.





