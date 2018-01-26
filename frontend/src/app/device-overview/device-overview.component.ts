import {Component, ViewEncapsulation} from '@angular/core';
import {Device, DeviceService, DeviceType} from '../device.service';
import {Group, GroupService} from '../group.service';
import {Observable} from 'rxjs/Observable';

@Component({
  selector: 'app-device-overview',
  templateUrl: './device-overview.component.html',
  styleUrls: ['./device-overview.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class DeviceOverviewComponent {
  DeviceType = DeviceType;
  selectedDevices: Observable<Array<Device>> = this.deviceService.getForGroup('null');
  currentGroups: Array<Group> = [];

  constructor(public deviceService: DeviceService, public groupService: GroupService) {
    this.groupService.items.subscribe(groups => this.currentGroups = groups);
  }

  selectGroup(index: number): void {
    this.selectedDevices = this.deviceService.getForGroup(index > 0 ? this.currentGroups[index - 1].id : 'null');
  }

  openAddDeviceDialog(): void {
    // TODO
  }

  openAddGroupDialog(): void {
    // TODO
  }
}
