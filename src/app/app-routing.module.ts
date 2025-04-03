import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReportsComponent } from './reports/reports.component';
import { HomeComponent } from './home/home.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { SalesComponent } from './sales/sales.component';
import { ErrorComponent } from './common/error/error.component';
import { LoginComponent } from './common/login/login.component';
import { UnauthorizedComponent } from './common/unauthorized/unauthorized.component';
import { BalancesComponent } from './balances/balances.component';
import { DetailsComponent } from './sales/details/details.component';
import { BalancesDetailsComponent } from './balances/balances-details/balances-details.component';
import { AuthGuard } from './_guard/auth.guard';
import { PwrecoveryComponent } from './common/login/pwrecovery/pwrecovery.component';
import { PwresetComponent } from './common/login/pwreset/pwreset.component';

const routes: Routes = [
  { path: '', component: DashboardComponent, canActivate: [AuthGuard], title:"DPOS - Dashboard"},
  { path: 'home', component: HomeComponent, title:"DPOS"   },
  { path: 'error', component: ErrorComponent },
  { path: 'unauthorized', component: UnauthorizedComponent },
  { path: 'login', component: LoginComponent, title:"DPOS - Login"    },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard], title:"DPOS - Dashboard"},
  { path: 'sales', component: SalesComponent, canActivate: [AuthGuard], title:"DPOS - Ventas"},
  { path: 'reports', component: ReportsComponent, canActivate: [AuthGuard], title:"DPOS - Informes"  },
  { path: 'balances', component: BalancesComponent, canActivate: [AuthGuard], title:"DPOS - Cierres"  },
  { path: 'details/:id', component:DetailsComponent, canActivate: [AuthGuard], title:"DPOS - Ventas"  },
  { path: 'balances-details/:id',component: BalancesDetailsComponent, canActivate: [AuthGuard], title:"DPOS - Cierres" },
  { path: 'login/password-recovery', component: PwrecoveryComponent, title:"DPOS - Recuperación de contraseña" },
  { path: 'password-reset', component: PwresetComponent, title:"DPOS - Recuperación de contraseña"  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
