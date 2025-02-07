import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AvatarComponent } from './page/avatar/avatar.component';
import { WaiterComponent } from './page/waiter/waiter.component';

const routes: Routes = [
  {
    path:"avatar",
    component:AvatarComponent
  },
  {
    path:"waiter",
    component:WaiterComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
