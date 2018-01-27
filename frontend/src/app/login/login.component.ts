import {Component} from '@angular/core';
import {AuthenticationService} from '../authentication.service';
import {MatSnackBar} from '@angular/material';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  hidePassword = true;
  email: string;
  password: string;

  constructor(private _snackBar: MatSnackBar, public authenticationService: AuthenticationService) {}

  login(): void {
    this.authenticationService.login(this.email, this.password).then(
      () => this._showSnackbarMessage('Successfully logged in!')
    ).catch(
      (error) => {
        console.error(error);
        this._showSnackbarMessage('Could not log in! ' + error.message);
      }
    );
  }

  register(): void {
    this.authenticationService.registerUser(this.email, this.password).then(
      () => this._showSnackbarMessage('Successfully registered new User!')
    ).catch(
      (error) => {
        console.error(error);
        this._showSnackbarMessage('Could not register new User! ' + error.message);
      }
    );
  }

  private _showSnackbarMessage(message: string): void {
    this._snackBar.open(message, null, {duration: 2000});
  }
}
