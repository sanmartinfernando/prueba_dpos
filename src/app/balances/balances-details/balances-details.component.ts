import { DownloadPDFService } from './../../_services/downloadpdf.service';
import { Balancedetailid } from './../../_services/balancedetailid.service';
import { EncryptionService } from './../../_services/encryption.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Data, Router, Routes } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BalanceDetailId } from 'src/app/_models/BalaceDetailId.model';

@Component({
  selector: 'DPOSW-balances-details',
  templateUrl: './balances-details.component.html',
  styleUrls: []
})
export class BalancesDetailsComponent implements OnInit{

  balances : BalanceDetailId;
  isLoggedIn:boolean = true;
  nPage:number=1;
  nRecords:number;
  itemTypeTax = 1;
  itemTypeTax2 = 2;
  itemTypeTax3 = 3;
  Math = Math;

  loadCompleted: boolean = false;
  element = true;

  balancesId:string;
  index:any;


  constructor(private route:ActivatedRoute ,
    private httpClient: HttpClient,
    private EncryptionService: EncryptionService,
    private paramsUrl: ActivatedRoute,
    private BalancedetailidService: Balancedetailid,
    private DownloadPDFService: DownloadPDFService) {
  }

  ngOnInit(): void {
    let iddecode = this.EncryptionService.decode(this.paramsUrl.snapshot.params['id']);
    this.balancesId = this.EncryptionService.decrypt(iddecode);
    this.BalancedetailidService.GetBalanceDetail(this.balancesId).subscribe(ticketBalances=>{
      this.balances=ticketBalances;
      this.loadCompleted = true;
  }/* ,
  (error) => {
    if (error.status == 401) {
      this.isLoggedIn = false;
    };
  } */
);
}


  donwloadPDF(){
    this.DownloadPDFService.downloadFile(this.balancesId)
  }



  itemType(arr :any[]){
    return arr.filter(item=> item.ItemType === this.itemTypeTax);
  }
  itemType2(arr :any[]){
    return arr.filter(item=> item.ItemType === this.itemTypeTax2);
  }
  itemType3(arr :any[]){
    return arr.filter(item=> item.ItemType === this.itemTypeTax3);
  }
  getDecimal(x :any){
    x = (x /100).toFixed(2).replace(".", ",")
    return x
  }
}




