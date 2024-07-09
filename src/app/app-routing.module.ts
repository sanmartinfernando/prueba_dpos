import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ClientsComponent } from './clients/clients.component';
import { HomeComponent } from './home/home.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { SalesComponent } from './sales/sales.component';
import { ErrorComponent } from './common/error/error.component';
import { LoginComponent } from './common/login/login.component';
import { UnauthorizedComponent } from './common/unauthorized/unauthorized.component';
import { BalancesComponent } from './balances/balances.component';
import { DetailsComponent } from './sales/details/details.component';
import { BalancesDetailsComponent } from './balances/balances-details/balances-details.component';
import { EditClientComponent } from './clients/edit-client/edit-client.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'home', component: HomeComponent },
  { path: 'error', component: ErrorComponent },
  { path: 'unauthorized', component: UnauthorizedComponent },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent},
  { path: 'sales', component: SalesComponent },
  { path: 'clients', component: ClientsComponent },
  { path: 'balances', component: BalancesComponent },
  { path: 'details/:id', component:DetailsComponent },
  { path: 'balances-details/:id',component: BalancesDetailsComponent},
  { path: 'edit-client/:id', component: EditClientComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
