import {Component} from '@angular/core';
import {MatDialogRef, MatSnackBar} from '@angular/material';
import {DeviceService} from '../device.service';

@Component({
  selector: 'app-add-device-dialog',
  templateUrl: './add-device-dialog.component.html',
  styleUrls: ['./add-device-dialog.component.css']
})
export class AddDeviceDialogComponent {
  deviceId: string;

  constructor(
    private _dialogRef: MatDialogRef<AddDeviceDialogComponent>,
    private _deviceService: DeviceService,
    private _snackBar: MatSnackBar
  ) {}

  add(): void {
    this._deviceService.addDevice(this.deviceId).then(
      () => this._dialogRef.close()
    ).catch(
      error => {
        console.error(error);
        this._snackBar.open('Could not add Device! ' + error.message, null, {duration: 2000})
      }
    );
  }
}
