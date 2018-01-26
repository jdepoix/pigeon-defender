import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {AuthenticationService} from './authentication.service';
import {DeviceService} from './device.service';
import {GroupService} from './group.service';
import {DeviceOverviewComponent} from './device-overview/device-overview.component';

@NgModule({
  declarations: [
    AppComponent,
    DeviceOverviewComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [
    AuthenticationService,
    DeviceService,
    GroupService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
