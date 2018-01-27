import {AuthenticationService} from './authentication.service';
import {DocumentClient} from 'aws-sdk/clients/dynamodb';
import {Observable} from 'rxjs/Observable';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';

export abstract class UserDataService<ModelType> {
  private _itemsSubject: BehaviorSubject<Array<ModelType>> = new BehaviorSubject<Array<ModelType>>([]);

  protected abstract readonly _tableName: string;

  items: Observable<Array<ModelType>> = this._itemsSubject.asObservable();

  constructor(protected _authenticationService: AuthenticationService) { }

  protected _loadItems(): Promise<Array<ModelType>> {
    return new DocumentClient().query({
      TableName: this._tableName,
      IndexName: 'userId-index',
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': this._authenticationService.currentUser.user.getUsername()
      }
    }).promise().then(result => {
      const items = <Array<ModelType>> result.Items;
      this._itemsSubject.next(items);
      return Promise.resolve(items);
    });
  }

  protected _clearItems(): void {
    this._itemsSubject.next([]);
  }
}
