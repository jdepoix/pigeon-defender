import {Injectable} from '@angular/core';
import {AuthenticationService} from './authentication.service';
import {DocumentClient} from 'aws-sdk/clients/dynamodb';
import {UserDataService} from './user-data.service';
import * as uuid from 'uuid';

export class Group {
  id: string;
  userId: string;
  name: string;
  active: boolean;
}

@Injectable()
export class GroupService extends UserDataService<Group> {
  protected readonly _tableName = 'PigeonDefender.Groups';

  constructor(authenticationService: AuthenticationService) {
    super(authenticationService);
    this._authenticationService.onLogin.subscribe(() => this._loadItems());
    this._authenticationService.onLogin.subscribe(() => this._clearItems());
    if (this._authenticationService.currentUser) {
      this._loadItems();
    }
  }

  add(name: string): Promise<Array<Group>> {
    return new DocumentClient().put({
      TableName: this._tableName,
      Item: {
        id: uuid(),
        name: name,
        userId: this._authenticationService.currentUser.user.getUsername(),
        active: true
      }
    }).promise().then(() => this._loadItems());
  }

  toggleCircuitBreaker(groupId: string): Promise<Array<Group>> {
    return new DocumentClient().get({
      TableName: this._tableName,
      Key: {id: groupId}
    }).promise().then(
      result => new DocumentClient().update({
        TableName: this._tableName,
        Key: {id: groupId},
        UpdateExpression: 'set active = :groupState',
        ExpressionAttributeValues: {':groupState': !result.Item.active}
      }
    ).promise()).then(() => this._loadItems());
  }
}
