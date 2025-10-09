import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DashboardComponent } from './dashboard/dashboard.component';
import { OperationsComponent } from './operations/operations.component';
import { DetailsComponent } from './operations/details/details.component';
import { ReportsComponent } from './reports/reports.component';
import { LoginComponent } from './common/login/login.component';
import { PwrecoveryComponent } from './common/login/pwrecovery/pwrecovery.component';
import { PwresetComponent } from './common/login/pwreset/pwreset.component';
import { BalancesComponent } from './balances/balances.component';
import { BalancesDetailsComponent } from './balances/balances-details/balances-details.component';
import { CustomersComponent } from './customers/customers.component';
import { DocumentsComponent } from './documents/documents.component';
import { CustomerDetailsComponent } from './customers/details/customer-details.component';
import { ProductsComponent } from './products/products.component';
import { ProductDetailsComponent } from './products/details/product-details.component';
import { TaxesComponent } from './taxes/taxes.component';
import { CookiesPolicyComponent } from './common/footer/cookies-policy.component';
import { UseConditionsComponent } from './common/footer/use-conditions.component';
import { PrivacyPolicyComponent } from './common/footer/privacy-policy.component';

import { AuthGuard } from './_guard/auth.guard';
import { AuthService } from './_services/auth.service';
import { InactivityService } from './_services/inactivity.service';

const routes: Routes = [
  { path: '', component: DashboardComponent, canActivate: [AuthGuard], title: 'DPOS - Inicio' },
  { path: 'cookies-policy', component: CookiesPolicyComponent, title: 'Política de cookies' },
  { path: 'use-conditions', component: UseConditionsComponent, title: 'Condiciones de uso' },
  { path: 'privacy-policy', component: PrivacyPolicyComponent, title: 'Política de privacidad' },
  { path: 'login', component: LoginComponent, title: 'DPOS - Login' },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard], title: 'DPOS - Inicio' },
  { path: 'operations', component: OperationsComponent, canActivate: [AuthGuard], title: 'DPOS - Operaciones' },
  { path: 'customers', component: CustomersComponent, canActivate: [AuthGuard], title: 'DPOS - Clientes' },
  { path: 'documents', component: DocumentsComponent, canActivate: [AuthGuard], title: 'DPOS - Documentos' },
  { path: 'reports', component: ReportsComponent, canActivate: [AuthGuard], title: 'DPOS - Informes' },
  { path: 'balances', component: BalancesComponent, canActivate: [AuthGuard], title: 'DPOS - Cierres' },
  { path: 'details/:id', component: DetailsComponent, canActivate: [AuthGuard], title: 'DPOS - Operaciones' },
  { path: 'balances-details/:id', component: BalancesDetailsComponent, canActivate: [AuthGuard], title: 'DPOS - Cierres' },
  { path: 'customer-details', component: CustomerDetailsComponent, canActivate: [AuthGuard], title: 'DPOS - Clientes' },
  { path: 'customer-details/:id', component: CustomerDetailsComponent, canActivate: [AuthGuard], title: 'DPOS - Clientes' },
  { path: 'products', component: ProductsComponent, canActivate: [AuthGuard], title: 'DPOS - Productos' },
  { path: 'product-details', component: ProductDetailsComponent, canActivate: [AuthGuard], title: 'DPOS - Productos' },
  { path: 'product-details/:id', component: ProductDetailsComponent, canActivate: [AuthGuard], title: 'DPOS - Productos' },
  { path: 'taxes', component: TaxesComponent, canActivate: [AuthGuard], title: 'DPOS - Impuestos' },
  { path: 'login/password-recovery', component: PwrecoveryComponent, title: 'DPOS - Recuperación de contraseña' },
  { path: 'password-reset', component: PwresetComponent, title: 'DPOS - Recuperación de contraseña' },
  { path: '**', redirectTo: '/login' }
];

/**
 * @class AppRoutingModule
 * @description
 * Módulo de enrutamiento principal de la aplicación.
 * Define las rutas y protege accesos mediante guardas de autenticación.
 */
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {

  /**
   * Inicializa el módulo de enrutamiento y verifica si el monitoreo de inactividad está activo.
   * Si no lo está, se ejecuta el cierre de sesión.
   * @param authService Servicio de autenticación para gestionar el cierre de sesión.
   * @param inactivity Servicio para verificar el estado del monitoreo de inactividad.
   */
  constructor(private authService: AuthService, private inactivity: InactivityService) {
    if (!this.inactivity.isMonitoringActive) {
      this.authService.logOut();
    }
  }
}
