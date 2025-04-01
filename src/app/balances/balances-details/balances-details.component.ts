import { DownloadPDFService } from '../../_services/download-pdf.service';
import { BalancesService } from '../../_services/balances.service';
import { EncryptionService } from './../../_services/encryption.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { StorageService } from 'src/app/_services/storage.service';
import { Balance } from 'src/app/_models/balance.model';

@Component({
  selector: 'DPOSW-balances-details',
  templateUrl: './balances-details.component.html',
  styleUrls: []
})
export class BalancesDetailsComponent implements OnInit {

  balances : Balance;
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

  constructor(private encryptionService: EncryptionService,
    private activatedRoute: ActivatedRoute,
    private balancesService: BalancesService,
    private downloadPDFService: DownloadPDFService,
    private storageService: StorageService) {
  }
  
  ngOnInit(): void {
    let iddecode = this.encryptionService.decode(this.activatedRoute.snapshot.params['id']);
    this.balancesId = this.encryptionService.decrypt(iddecode);

    this.balancesService.getBalanceDetail(this.balancesId).subscribe(
      {
        next: (ticketBalances) => {
          this.balances=ticketBalances;
          this.loadCompleted = true;
        },
        error: (error) => {
          if (error.status == 401 || error.status == 500) {
            this.loadCompleted = true;
          };
        }
      });
  }
  
  donwloadPDF(){
    this.downloadPDFService.downloadBalancesFile(this.balancesId);
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
    x = (x /100).toFixed(2).replace(".", ",");
    return x;
  }
}
