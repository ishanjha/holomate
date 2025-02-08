import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AvatarComponent } from './Holomate/avatar/avatar.component';
import { ChatholomateComponent } from './Holomate/chatholomate/chatholomate.component';
import { WaiterComponent } from './Holomate/waiter/waiter.component';

@NgModule({
  declarations: [
    AppComponent,
    AvatarComponent,
    ChatholomateComponent,
    WaiterComponent
    
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
