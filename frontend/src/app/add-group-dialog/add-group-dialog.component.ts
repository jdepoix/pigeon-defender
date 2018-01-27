import {Component} from '@angular/core';
import {MatDialogRef, MatSnackBar} from '@angular/material';
import {GroupService} from '../group.service';

@Component({
  selector: 'app-add-group-dialog',
  templateUrl: './add-group-dialog.component.html',
  styleUrls: ['./add-group-dialog.component.css']
})
export class AddGroupDialogComponent {
  groupName: string;

  constructor(
    private _dialogRef: MatDialogRef<AddGroupDialogComponent>,
    private _groupService: GroupService,
    private _snackBar: MatSnackBar
  ) {}

  add(): void {
    this._groupService.add(this.groupName).then(
      () => this._dialogRef.close()
    ).catch(
      error => {
        console.error(error);
        this._snackBar.open('Could not add Group! ' + error.message, null, {duration: 2000})
      }
    );
  }
}
