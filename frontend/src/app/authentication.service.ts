import {Injectable} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import * as AWS from 'aws-sdk/global';
import {AuthenticationDetails, CognitoUser, CognitoUserPool} from 'amazon-cognito-identity-js';
import {CognitoIdentityCredentials} from 'aws-sdk';
import {environment} from '../environments/environment';
import {Observable} from 'rxjs/Observable';

export class PigeonDefenderUser {
  constructor(public email: string, public user: CognitoUser) {}
}

@Injectable()
export class AuthenticationService {
  private static _USER_POOL: CognitoUserPool = new CognitoUserPool({
    UserPoolId : environment.aws.cognito.userPoolId,
    ClientId : environment.aws.cognito.appClientId
  });
  private _loginSubject: Subject<PigeonDefenderUser> = new Subject<PigeonDefenderUser>();
  private _logoutSubject: Subject<void> = new Subject<void>();
  onLogin: Observable<PigeonDefenderUser> = this._loginSubject.asObservable();
  onLogout: Observable<void> = this._logoutSubject.asObservable();
  currentUser: PigeonDefenderUser = null;

  constructor() {
    AWS.config.region = environment.aws.region;
  }

  login(username: string, password: string): Promise<PigeonDefenderUser> {
    return new Promise<PigeonDefenderUser>((resolve, reject) => {
      const user = new CognitoUser({
        Username : username,
        Pool : AuthenticationService._USER_POOL
      });
      user.authenticateUser(
        new AuthenticationDetails({
          Username : username,
          Password : password,
        }),
        {
          onSuccess: (result) => {
            AWS.config.credentials = new AWS.CognitoIdentityCredentials(<CognitoIdentityCredentials.CognitoIdentityOptions> {
              IdentityPoolId: environment.aws.cognito.identifyPoolId,
              Logins: {
                ['cognito-idp.' + environment.aws.region + '.amazonaws.com/' + environment.aws.cognito.userPoolId]:
                  result.getIdToken().getJwtToken()
              }
            });

            (<AWS.CognitoIdentityCredentials> AWS.config.credentials).refresh((error) => {
              if (error) {
                reject(error);
              } else {
                this.currentUser = new PigeonDefenderUser(username, user);
                this._loginSubject.next(this.currentUser);
                resolve(this.currentUser);
              }
            });
          },
          onFailure: reject
        }
      );
    });
  }

  logout(): void {
    if (this.currentUser) {
      this.currentUser.user.signOut();
      (<AWS.CognitoIdentityCredentials> AWS.config.credentials).clearCachedId();
      this.currentUser = null;
      this._logoutSubject.next();
    }
  }

  registerUser(username: string, password: string): Promise<void> {
    return new Promise<void>(
      (resolve, reject) => AuthenticationService._USER_POOL.signUp(
        username, password, [], null, function(error, result) {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        }
      )
    );
  }
}
