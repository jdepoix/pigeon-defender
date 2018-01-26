import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {FormsModule} from '@angular/forms';
import {MatToolbarModule, MatIconModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatSnackBarModule} from '@angular/material';

import {AppComponent} from './app.component';
import {AuthenticationService} from './authentication.service';
import {DeviceService} from './device.service';
import {GroupService} from './group.service';
import {DeviceOverviewComponent} from './device-overview/device-overview.component';
import {LoginComponent} from './login/login.component';

@NgModule({
  declarations: [
    AppComponent,
    DeviceOverviewComponent,
    LoginComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    // angular material modules
    MatToolbarModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule
  ],
  providers: [
    AuthenticationService,
    DeviceService,
    GroupService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
