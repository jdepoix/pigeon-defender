import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {MatToolbarModule, MatIconModule, MatCardModule} from '@angular/material';

import {AppComponent} from './app.component';
import {AuthenticationService} from './authentication.service';
import {DeviceService} from './device.service';
import {GroupService} from './group.service';
import {DeviceOverviewComponent} from './device-overview/device-overview.component';
import { LoginComponent } from './login/login.component';

@NgModule({
  declarations: [
    AppComponent,
    DeviceOverviewComponent,
    LoginComponent
  ],
  imports: [
    BrowserModule,
    MatToolbarModule,
    MatIconModule,
    MatCardModule
  ],
  providers: [
    AuthenticationService,
    DeviceService,
    GroupService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
