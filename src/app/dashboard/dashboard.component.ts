import { BalanceidService } from './../_services/balanceid.service';
import { Component, OnInit } from '@angular/core';
import { BalanceId } from '../_models/BalanceId.model';


@Component({
  selector: 'DPOSW-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: []
})
export class DashboardComponent implements OnInit{

  constructor(private BalanceidService: BalanceidService) { }

id: string= "abbed063-33a2-4eff-a603-aef57d856eab";
balances: BalanceId;
ticketAverage: number;
isLoggedIn: boolean = true;




ngOnInit(): void {



  this.BalanceidService.GetBalanceId(this.id).subscribe((balance) => {
    this.balances = balance;
    if (this.balances.sales>0 && this.balances.salesCount>0){
      this.ticketAverage= this.balances.sales/this.balances.salesCount;
    } else {
      this.ticketAverage=0;
    }




  }/* ,
  (error) => {
    if (error.status == 401) {
      this.isLoggedIn = false;
    };
  } */);





}

}
