import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {FormsModule} from '@angular/forms';
import {
  MatToolbarModule, MatIconModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatSnackBarModule, MatTabsModule,
  MatDialogModule
} from '@angular/material';

import {AppComponent} from './app.component';
import {AuthenticationService} from './authentication.service';
import {DeviceService} from './device.service';
import {GroupService} from './group.service';
import {DeviceOverviewComponent} from './device-overview/device-overview.component';
import {LoginComponent} from './login/login.component';
import { AddGroupDialogComponent } from './add-group-dialog/add-group-dialog.component';
import { AddDeviceDialogComponent } from './add-device-dialog/add-device-dialog.component';

@NgModule({
  declarations: [
    AppComponent,
    DeviceOverviewComponent,
    LoginComponent,
    AddGroupDialogComponent,
    AddDeviceDialogComponent
  ],
  entryComponents: [
    AddGroupDialogComponent,
    AddDeviceDialogComponent
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
    MatSnackBarModule,
    MatTabsModule,
    MatDialogModule
  ],
  providers: [
    AuthenticationService,
    DeviceService,
    GroupService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
