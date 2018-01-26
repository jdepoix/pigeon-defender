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
  protected readonly tableName = 'PigeonDefender.Groups';

  constructor(authenticationService: AuthenticationService) {
    super(authenticationService);
  }

  add(name: string): Promise<Array<Group>> {
    return new DocumentClient().put({
      TableName: this.tableName,
      Item: {
        id: uuid(),
        name: name,
        userId: this._authenticationService.currentUser.user.getUsername(),
        active: true
      }
    }).promise().then(() => this._loadItems());
  }

  toggleCircuitBreaker(): Promise<void> {
    // TODO
    return null;
  }
}
