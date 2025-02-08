import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AvatarComponent } from './Holomate/avatar/avatar.component';
import { WaiterComponent } from './Holomate/waiter/waiter.component';
import { ChatholomateComponent } from './Holomate/chatholomate/chatholomate.component';


const routes: Routes = [
  {
    path:"avatar",
    component:AvatarComponent
  },
  {
    path:"",
    component:WaiterComponent
  },
  {
    path:"chat",
    component:ChatholomateComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
