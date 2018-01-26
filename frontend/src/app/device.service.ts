import {Injectable} from '@angular/core';
import {AuthenticationService} from './authentication.service';
import {DocumentClient} from 'aws-sdk/clients/dynamodb';
import {UserDataService} from './user-data.service';

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
  protected readonly tableName = 'PigeonDefender.Devices';

  constructor(authenticationService: AuthenticationService) {
    super(authenticationService);
  }

  getForGroup(groupId: string): Array<Device> {
    return this.items.filter(item => item.groupId === groupId);
  }

  addDevice(deviceId: string): Promise<Array<Device>> {
    return new DocumentClient().update({
      TableName: this.tableName,
      Key: {id: deviceId},
      UpdateExpression: 'set userId = :userId',
      ExpressionAttributeValues: {':userId': this._authenticationService.currentUser.user.getUsername()}
    }).promise().then(() => this._loadItems());
  }

  addDeviceToGroup(deviceId: string, groupId: string): Promise<Array<Device>> {
    return new DocumentClient().update({
      TableName: this.tableName,
      Key: {id: deviceId},
      UpdateExpression: 'set groupId = :groupId',
      ExpressionAttributeValues: {':groupId': groupId }
    }).promise().then(() => this._loadItems());
  }
}
