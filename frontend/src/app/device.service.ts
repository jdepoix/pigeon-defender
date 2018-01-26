import {Injectable} from '@angular/core';
import {AuthenticationService} from './authentication.service';
import {DocumentClient} from 'aws-sdk/clients/dynamodb';
import {UserDataService} from './user-data.service';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/map';

export enum DeviceType {
  SENSOR = 'SENSOR',
  ACTOR = 'ACTOR',
  CIRCUIT_BREAKER = 'CIRCUIT_BREAKER'
}

export interface Device {
  id: string;
  userId: string;
  groupId: string;
  type: DeviceType;
}

@Injectable()
export class DeviceService extends UserDataService<Device> {
  protected readonly _tableName = 'PigeonDefender.Devices';

  constructor(authenticationService: AuthenticationService) {
    super(authenticationService);
    this._authenticationService.onLogin.subscribe(() => this._loadItems());
    this._authenticationService.onLogin.subscribe(() => this._clearItems());
    if (this._authenticationService.currentUser) {
      this._loadItems();
    }
  }

  getForGroup(groupId: string): Observable<Array<Device>> {
    return this.items.map(items => items.filter(item => item.groupId === groupId));
  }

  addDevice(deviceId: string): void {
    new DocumentClient().update({
      TableName: this._tableName,
      Key: {id: deviceId},
      UpdateExpression: 'set userId = :userId',
      ExpressionAttributeValues: {':userId': this._authenticationService.currentUser.user.getUsername()}
    }).promise().then(() => this._loadItems());
  }

  addDeviceToGroup(deviceId: string, groupId: string): void {
    new DocumentClient().update({
      TableName: this._tableName,
      Key: {id: deviceId},
      UpdateExpression: 'set groupId = :groupId',
      ExpressionAttributeValues: {':groupId': groupId }
    }).promise().then(() => this._loadItems());
  }
}
