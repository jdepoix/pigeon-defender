import {AuthenticationService} from './authentication.service';
import {DocumentClient} from 'aws-sdk/clients/dynamodb';

export abstract class UserDataService<ModelType> {
  protected abstract readonly tableName: string;

  items: Array<ModelType> = [];

  constructor(protected _authenticationService: AuthenticationService) {
    this._authenticationService.onLogin.subscribe(() => this._loadItems());
    this._authenticationService.onLogin.subscribe(() => this.items = []);
  }

  protected _loadItems(): Promise<Array<ModelType>> {
    return new DocumentClient().query({
      TableName: this.tableName,
      IndexName: 'userId-index',
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': this._authenticationService.currentUser.user.getUsername()
      }
    }).promise().then(result => {
      this.items = <Array<ModelType>> result.Items;
      return Promise.resolve(this.items);
    });
  }
}
