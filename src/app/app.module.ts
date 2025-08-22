import { APP_INITIALIZER, CUSTOM_ELEMENTS_SCHEMA, LOCALE_ID, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClient, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CurrencyPipe, DatePipe, registerLocaleData } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { QRCodeModule } from 'angularx-qrcode';
import { CountdownComponent } from 'ngx-countdown';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './common/header/header.component';
import { FooterComponent } from './common/footer/footer.component';
import { LangSwitcherComponent } from './common/lang-switcher/lang-switcher.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { SalesComponent } from './sales/sales.component';
import { ReportsComponent } from './reports/reports.component';
import { LoginComponent } from './common/login/login.component';
import { BalancesComponent } from './balances/balances.component';
import { DetailsComponent } from './sales/details/details.component';
import { BalancesDetailsComponent } from './balances/balances-details/balances-details.component';
import { PwrecoveryComponent } from './common/login/pwrecovery/pwrecovery.component';
import { PwresetComponent } from './common/login/pwreset/pwreset.component';
import { ModalComponent } from './modal/modal.component';
import { CookiesPolicyComponent } from './common/footer/cookies-policy.component';
import { PrivacyPolicyComponent } from './common/footer/privacy-policy.component';
import { UseConditionsComponent } from './common/footer/use-conditions.component';
import { CustomersComponent } from './customers/customers.component';
import { CustomerDetailsComponent } from './customers/details/customer-details.component';
import { ProductsComponent } from './products/products.component';
import { ProductDetailsComponent } from './products/details/product-details.component';
import { TaxesComponent } from './taxes/taxes.component';
import { TaxesModalComponent } from './taxes/taxes-modal.component';
import { CategoryModalComponent } from './categories/category-modal.component';
import { ModifiersModalComponent } from './modifiers/modifiers-modal.component';

import { httpInterceptorProviders } from './_rest/http.interceptor';
import { AuthGuard } from './_guard/auth.guard';
import { SessionService } from './_services/session.service';

import localeEs from '@angular/common/locales/es';
import { CurrencyInputDirective } from './_utils/currency-input.directive';
registerLocaleData(localeEs);

/**
 * @class AppModule
 * @description
 * Módulo raíz de la aplicación.
 * Configura componentes, módulos, proveedores y la inicialización de traducciones y configuración regional.
 */
@NgModule({ declarations: [
        AppComponent,
        ModalComponent,
        HeaderComponent,
        FooterComponent,
        CookiesPolicyComponent,
        PrivacyPolicyComponent,
        UseConditionsComponent,
        LangSwitcherComponent,
        DashboardComponent,
        SalesComponent,
        CustomersComponent,
        CustomerDetailsComponent,
        TaxesComponent,
        TaxesModalComponent,
        CategoryModalComponent,
        ModifiersModalComponent,
        ProductsComponent,
        CurrencyInputDirective,
        ProductDetailsComponent,
        LoginComponent,
        BalancesComponent,
        DetailsComponent,
        BalancesDetailsComponent,
        ReportsComponent,
        PwrecoveryComponent,
        PwresetComponent

    ],
    bootstrap: [AppComponent],
    imports: [BrowserModule,
        AppRoutingModule,
        FormsModule,
        NgxPaginationModule,
        ReactiveFormsModule,
        RouterModule,
        MatDialogModule,
        MatFormFieldModule,
        MatSelectModule,
        MatIconModule,
        MatButtonModule,
        FormsModule,
        NgxChartsModule,
        BrowserAnimationsModule,
        QRCodeModule,
        CountdownComponent,
        TranslateModule,
        TranslateModule.forRoot({
           loader: {
               provide: TranslateLoader,
               useFactory: HttpLoaderFactory,
               deps: [HttpClient]
           }
        }),
      ],
      providers: [
        httpInterceptorProviders,
        DatePipe,
        CurrencyPipe,
        provideHttpClient(withInterceptorsFromDi()),
        NgxChartsModule,
        BrowserAnimationsModule,
        AuthGuard,
        {
          provide: LOCALE_ID,
          useValue: 'es-ES',
        },
        {
          provide: APP_INITIALIZER,
          useFactory: setupTranslateFactory,
          deps: [SessionService, TranslateService],
          multi: true
        }
      ],
      exports: [CurrencyInputDirective],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
export class AppModule { }

/**
 * Crea un cargador de traducciones HTTP.
 * @param http Cliente HTTP para cargar archivos de traducción.
 * @returns Instancia de TranslateHttpLoader configurada.
 */
export function HttpLoaderFactory(http: HttpClient): TranslateHttpLoader {
  return new TranslateHttpLoader(http, 'assets/i18n/', '.json');
}

/**
 * Configura el idioma inicial de la aplicación según la sesión del usuario.
 * @param session Servicio de sesión para obtener el idioma almacenado.
 * @param translate Servicio de traducción para aplicar el idioma.
 * @returns Función que inicializa el idioma.
 */
export function setupTranslateFactory(session: SessionService, translate: TranslateService) {
  let language: string = session.getItem(SessionService.LANGUAGE);
  language = language !== null ? language : 'es';
  return () => translate.use(language).toPromise();
}