import { LOCALE_ID, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './common/header/header.component';
import { FooterComponent } from './common/footer/footer.component';
import { LangSwitcherComponent } from './common/lang-switcher/lang-switcher.component';
import { HomeComponent } from './home/home.component';
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
import { DatePipe } from '@angular/common';
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

registerLocaleData(localeEs);

@NgModule({ declarations: [
        AppComponent,
        HeaderComponent,
        FooterComponent,
        LangSwitcherComponent,
        HomeComponent,
        DashboardComponent,
        SalesComponent,
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
        provideHttpClient(withInterceptorsFromDi()),
        NgxChartsModule,
        BrowserAnimationsModule,
        AuthGuard,
        {
          provide: LOCALE_ID,
          useValue: 'es-ES',
        }

    ] })
export class AppModule { }

// AOT compilation support for ngx-translate loader
export function HttpLoaderFactory(http: HttpClient): TranslateHttpLoader {
  return new TranslateHttpLoader(http, 'assets/i18n/', '.json');
}