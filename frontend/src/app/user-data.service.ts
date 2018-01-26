import {AuthenticationService} from './authentication.service';
import {DocumentClient} from 'aws-sdk/clients/dynamodb';
import {Observable} from 'rxjs/Observable';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';

export abstract class UserDataService<ModelType> {
  private _itemsSubject: BehaviorSubject<Array<ModelType>> = new BehaviorSubject<Array<ModelType>>([]);

  protected abstract readonly _tableName: string;

  items: Observable<Array<ModelType>> = this._itemsSubject.asObservable();

  constructor(protected _authenticationService: AuthenticationService) { }

  protected _loadItems(): void {
    new DocumentClient().query({
      TableName: this._tableName,
      IndexName: 'userId-index',
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': this._authenticationService.currentUser.user.getUsername()
      }
    }).promise().then(result => this._itemsSubject.next(<Array<ModelType>> result.Items));
  }

  protected _clearItems(): void {
    this._itemsSubject.next([]);
  }
}
