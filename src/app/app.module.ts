import { APP_INITIALIZER, CUSTOM_ELEMENTS_SCHEMA, LOCALE_ID, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
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
import { ErrorComponent } from './common/error/error.component';
import { LoginComponent } from './common/login/login.component';
import { BaseComponent } from './common/base/base.component';
import { httpInterceptorProviders } from './_helpers/http.interceptor';
import { HttpClient, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UnauthorizedComponent } from './common/unauthorized/unauthorized.component';
import { BalancesComponent } from './balances/balances.component';
import { DetailsComponent } from './sales/details/details.component';
import {NgxPaginationModule} from 'ngx-pagination';
import { BalancesDetailsComponent } from './balances/balances-details/balances-details.component';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgxChartsModule }from '@swimlane/ngx-charts';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AuthGuard } from './_guard/auth.guard';
import { QRCodeModule } from 'angularx-qrcode';
import { PwrecoveryComponent } from './common/login/pwrecovery/pwrecovery.component';
import { PwresetComponent } from './common/login/pwreset/pwreset.component';
import { CountdownComponent } from 'ngx-countdown';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { ModalComponent } from './modal/modal.component';
import { CookiesPolicyComponent } from './common/footer/cookies-policy.component';
import { PrivacyPolicyComponent } from './common/footer/privacy-policy.component';
import { UseConditionsComponent } from './common/footer/use-conditions.component';
import { SessionService } from './_services/session.service';
import { CustomersComponent } from './customers/customers.component';
import { CustomerDetailsComponent } from './customers/details/customer-details.component';
import { ProductsComponent } from './products/products.component';
import { ProductDetailsComponent } from './products/details/product-details.component';
import { TaxesComponent } from './taxes/taxes.component';
import { TaxesModalComponent } from './taxes/taxes-modal.component';
import { MatDialogModule } from '@angular/material/dialog';

registerLocaleData(localeEs);

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
        ProductsComponent,
        ProductDetailsComponent,
        ErrorComponent,
        LoginComponent,
        BaseComponent,
        UnauthorizedComponent,
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
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
export class AppModule { }

// AOT compilation support for ngx-translate loader
export function HttpLoaderFactory(http: HttpClient): TranslateHttpLoader {
  return new TranslateHttpLoader(http, 'assets/i18n/', '.json');
}

export function setupTranslateFactory(session: SessionService, translate: TranslateService) {

  let language: string = session.getItem(SessionService.LANGUAGE);
  language = language != null ? language : 'es';
  return () => translate.use(language).toPromise();
}