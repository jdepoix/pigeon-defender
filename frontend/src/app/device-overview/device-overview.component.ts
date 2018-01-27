import {Component, ViewEncapsulation} from '@angular/core';
import {Device, DeviceService, DeviceType} from '../device.service';
import {Group, GroupService} from '../group.service';
import {Observable} from 'rxjs/Observable';
import {MatDialog} from '@angular/material';
import {AddDeviceDialogComponent} from '../add-device-dialog/add-device-dialog.component';
import {AddGroupDialogComponent} from '../add-group-dialog/add-group-dialog.component';
import {animate, keyframes, state, style, transition, trigger} from '@angular/animations';

@Component({
  selector: 'app-device-overview',
  templateUrl: './device-overview.component.html',
  styleUrls: ['./device-overview.component.css'],
  encapsulation: ViewEncapsulation.None,
  animations: [
    trigger('flyInOut', [
      state('in', style({transform: 'translateX(0)'})),
      transition('void => *', [
        animate(300, keyframes([
          style({opacity: 0, transform: 'translateX(-100%)', offset: 0}),
          style({opacity: 1, transform: 'translateX(15px)',  offset: 0.3}),
          style({opacity: 1, transform: 'translateX(0)',     offset: 1.0})
        ]))
      ]),
      transition('* => void', [
        animate(300, keyframes([
          style({opacity: 1, transform: 'translateX(0)', offset: 0}),
          style({opacity: 1, transform: 'translateX(-15px)', offset: 0.7}),
          style({opacity: 0, transform: 'translateX(100%)',  offset: 1.0})
        ]))
      ])
    ])
  ]
})
export class DeviceOverviewComponent {
  DeviceType = DeviceType;
  selectedDevices: Observable<Array<Device>> = this.deviceService.getForGroup('null');
  currentGroups: Array<Group> = [];

  constructor(public deviceService: DeviceService, public groupService: GroupService, private _dialog: MatDialog) {
    this.groupService.items.subscribe(groups => this.currentGroups = groups);
  }

  selectGroup(index: number): void {
    this.selectedDevices = this.deviceService.getForGroup(index > 0 ? this.currentGroups[index - 1].id : 'null');
  }

  openAddDeviceDialog(): void {
    this._dialog.open(AddDeviceDialogComponent, {
      width: '600px'
    });
  }

  openAddGroupDialog(): void {
    this._dialog.open(AddGroupDialogComponent, {
      width: '600px'
    });
  }

  identifyDevice(index: number, device: Device): string {
    return device.id;
  }
}
