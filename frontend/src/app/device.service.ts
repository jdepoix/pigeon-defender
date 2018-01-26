import {Injectable} from '@angular/core';
import {AuthenticationService} from './authentication.service';
import {DocumentClient} from 'aws-sdk/clients/dynamodb';

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

@Injectable()export class DeviceService {
  private static _DEVICE_TABLE = 'PigeonDefender.Devices';

  devices: Array<Device> = [];

  constructor(private _authenticationService: AuthenticationService) {
    this._authenticationService.onLogin.subscribe(() => this._loadDevices());
    this._authenticationService.onLogin.subscribe(() => this.devices = []);
  }

  private _loadDevices(): Promise<Array<Device>> {
    return new DocumentClient().query({
      TableName: DeviceService._DEVICE_TABLE,
      IndexName: 'userId-index',
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': this._authenticationService.currentUser.user.getUsername()
      }
    }).promise().then(result => {
      this.devices = <Array<Device>> result.Items;
      return Promise.resolve(this.devices);
    });
  }

  getForGroup(groupId: string): Array<Device> {
    return this.devices.filter(item => item.groupId === groupId);
  }

  addDevice(deviceId: string): Promise<Array<Device>> {
    return new DocumentClient().update({
      TableName: DeviceService._DEVICE_TABLE,
      Key: {id: deviceId},
      UpdateExpression: 'set userId = :userId',
      ExpressionAttributeValues: {':userId': this._authenticationService.currentUser.user.getUsername()}
    }).promise().then(() => this._loadDevices());
  }

  addDeviceToGroup(deviceId: string, groupId: string): Promise<Array<Device>> {
    return new DocumentClient().update({
      TableName: DeviceService._DEVICE_TABLE,
      Key: {id: deviceId},
      UpdateExpression: 'set groupId = :groupId',
      ExpressionAttributeValues: {':groupId': groupId }
    }).promise().then(() => this._loadDevices());
  }
}
