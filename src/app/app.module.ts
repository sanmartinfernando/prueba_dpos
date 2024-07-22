import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './common/header/header.component';
import { FooterComponent } from './common/footer/footer.component';
import { HomeComponent } from './home/home.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { SalesComponent } from './sales/sales.component';
import { ReportsComponent } from './reports/reports.component';
import { ErrorComponent } from './common/error/error.component';
import { LoginComponent } from './common/login/login.component';
import { BaseComponent } from './common/base/base.component';
import { httpInterceptorProviders } from './_helpers/http.interceptor';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UnauthorizedComponent } from './common/unauthorized/unauthorized.component';
import { LanguageManagerService } from './_services/languagemanager.service';
import { TranslatePipe } from './_pipes/translate.pipe';
import { BalancesComponent } from './balances/balances.component';
import { DetailsComponent } from './sales/details/details.component';
import {NgxPaginationModule} from 'ngx-pagination';
import { BalancesDetailsComponent } from './balances/balances-details/balances-details.component';
import { DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgxChartsModule }from '@swimlane/ngx-charts';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AuthGuard } from './_guard/auth.guard';


@NgModule({ declarations: [
        AppComponent,
        TranslatePipe,
        HeaderComponent,
        FooterComponent,
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
        ReportsComponent
    ],
    bootstrap: [AppComponent],
    imports: [BrowserModule,
        AppRoutingModule,
        FormsModule,
        NgxPaginationModule,
        ReactiveFormsModule,
        RouterModule,
        NgxChartsModule,
        BrowserAnimationsModule
      ],
        providers: [
        httpInterceptorProviders,
        LanguageManagerService,
        DatePipe,
        provideHttpClient(withInterceptorsFromDi()),
        NgxChartsModule,
        BrowserAnimationsModule,
        AuthGuard

    ] })
export class AppModule { }
