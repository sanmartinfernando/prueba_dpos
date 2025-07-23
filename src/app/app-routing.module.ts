import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReportsComponent } from './reports/reports.component';
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
import { AuthService } from './_services/auth.service';
import { InactivityService } from './_services/inactivity.service';
import { CookiesPolicyComponent } from './common/footer/cookies-policy.component';
import { UseConditionsComponent } from './common/footer/use-conditions.component';
import { PrivacyPolicyComponent } from './common/footer/privacy-policy.component';
import { CustomersComponent } from './customers/customers.component';
import { CustomerDetailsComponent } from './customers/details/customer-details.component';
import { ProductsComponent } from './products/products.component';
import { ProductDetailsComponent } from './products/details/product-details.component';

const routes: Routes = [
  { path: '', component: DashboardComponent, canActivate: [AuthGuard], title:"DPOS - Dashboard"},
  { path: 'cookies-policy', component: CookiesPolicyComponent, title:"Política de cookies"   },
  { path: 'use-conditions', component: UseConditionsComponent, title:"Condiciones de uso"   },
  { path: 'privacy-policy', component: PrivacyPolicyComponent, title:"Política de privacidad"   },
  { path: 'error', component: ErrorComponent },
  { path: 'unauthorized', component: UnauthorizedComponent },
  { path: 'login', component: LoginComponent, title:"DPOS - Login"    },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard], title:"DPOS - Dashboard"},
  { path: 'sales', component: SalesComponent, canActivate: [AuthGuard], title:"DPOS - Ventas"},
  { path: 'customers', component: CustomersComponent, canActivate: [AuthGuard], title:"DPOS - Clientes"},
  { path: 'reports', component: ReportsComponent, canActivate: [AuthGuard], title:"DPOS - Informes"  },
  { path: 'balances', component: BalancesComponent, canActivate: [AuthGuard], title:"DPOS - Cierres"  },
  { path: 'details/:id', component:DetailsComponent, canActivate: [AuthGuard], title:"DPOS - Ventas"  },
  { path: 'balances-details/:id',component: BalancesDetailsComponent, canActivate: [AuthGuard], title:"DPOS - Cierres" },
  { path: 'customer-details',component: CustomerDetailsComponent, canActivate: [AuthGuard], title:"DPOS - Clientes" },
  { path: 'customer-details/:id',component: CustomerDetailsComponent, canActivate: [AuthGuard], title:"DPOS - Clientes" },
  { path: 'products', component: ProductsComponent, canActivate: [AuthGuard], title:"DPOS - Productos"},
  { path: 'product-details',component: ProductDetailsComponent, canActivate: [AuthGuard], title:"DPOS - Productos" },
  { path: 'product-details/:id',component: ProductDetailsComponent, canActivate: [AuthGuard], title:"DPOS - Productos" },
  { path: 'login/password-recovery', component: PwrecoveryComponent, title:"DPOS - Recuperación de contraseña" },
  { path: 'password-reset', component: PwresetComponent, title:"DPOS - Recuperación de contraseña"  },
  { path: '**', redirectTo: '/login' } //Redirigir a login en caso de ruta no encontrada
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { 

  constructor(private authService: AuthService, private inactivity: InactivityService) {
    // En el momento de cargar el módulo, al detectar una ruta incorrecta, hacer logout
    // Es importante hacer esto en el constructor de AppRoutingModule para asegurarte de que
    // el logout ocurra cuando se intente acceder a una ruta no válida.
    if(!inactivity.isMonitoringActive) {
      this.authService.logOut();
    }
  }
}
