import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './common/header/header.component';
import { FooterComponent } from './common/footer/footer.component';
import { HomeComponent } from './home/home.component';
import { ProductsComponent } from './products/products.component';
import { SalesComponent } from './sales/sales.component';
import { ClientsComponent } from './clients/clients.component';
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
import { DataServices } from './balances/data.services';
import { DatePipe } from '@angular/common';
import { AddProductComponent } from './products/add-product/add-product.component';
import { EditProductComponent } from './products/edit-product/edit-product.component';
import { ClientServiceService } from './clients/client.service.service';
import { RouterModule } from '@angular/router';


@NgModule({ declarations: [
        AppComponent,
        TranslatePipe,
        HeaderComponent,
        FooterComponent,
        HomeComponent,
        ProductsComponent,
        SalesComponent,
        ClientsComponent,
        ErrorComponent,
        LoginComponent,
        BaseComponent,
        UnauthorizedComponent,
        BalancesComponent,
        DetailsComponent,
        BalancesDetailsComponent,
        AddProductComponent,
        EditProductComponent,
    ],
    bootstrap: [AppComponent], imports: [BrowserModule,
        AppRoutingModule,
        FormsModule,
        NgxPaginationModule,
        ReactiveFormsModule,
        RouterModule], providers: [
        httpInterceptorProviders,
        LanguageManagerService,
        DataServices,
        DatePipe,
        ClientServiceService,
        provideHttpClient(withInterceptorsFromDi())
    ] })
export class AppModule { }
