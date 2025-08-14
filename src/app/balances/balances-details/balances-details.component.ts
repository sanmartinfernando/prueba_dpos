import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Balance } from 'src/app/_models/balance.model';
import { BalanceLine } from 'src/app/_models/balance-line.model';
import { BalancesService } from '../../_services/balances.service';
import { DownloadPDFService } from '../../_services/download-pdf.service';
import { EncryptionService } from './../../_services/encryption.service';
import { SessionService } from 'src/app/_services/session.service';
import { ThemeService } from 'src/app/_services/theme.service';
import { UIStateService } from 'src/app/_services/ui-state.service';

/**
 * Componente encargado de mostrar el detalle de un cierre de caja,
 * calcular totales y permitir la descarga del mismo en formato PDF.
 */
@Component({
  selector: 'app-dpos-balances-details',
  templateUrl: './balances-details.component.html',
  styleUrls: []
})
export class BalancesDetailsComponent implements OnInit {

  private encryptionService = inject(EncryptionService);
  private activatedRoute = inject(ActivatedRoute);
  private balancesService = inject(BalancesService);
  private downloadPDFService = inject(DownloadPDFService);
  private uiStateService = inject(UIStateService);
  private sessionService = inject(SessionService);
  private themeService = inject(ThemeService);

  balances: Balance;
  balancesId: string;

  isLoggedIn = true;
  nPage = 1;
  nRecords: number;
  itemTypeTax = 1;
  itemTypeTax2 = 2;
  itemTypeTax3 = 3;
  Math = Math;
  loadCompleted = false;
  element = true;
  index: number;

  base = 0;
  cuota = 0;
  total = 0;
  pmTotal = 0;

  constructor() {
    this.themeService.loadTheme(this.sessionService.getItem(SessionService.RESELLER_NAME));
    this.uiStateService.setFormSelectEnabled(false);
  }

  /**
   * Inicializa el componente cargando los datos del cierre de caja
   * y calculando los totales correspondientes.
   */
  ngOnInit(): void {
    const iddecode = this.encryptionService.decode(this.activatedRoute.snapshot.params['id']);
    this.balancesId = this.encryptionService.decrypt(iddecode);

    this.balancesService.getBalanceDetail(this.balancesId).subscribe({
      next: (ticketBalances) => {
        this.balances = ticketBalances;
        this.calculateTotals();
        this.loadCompleted = true;
      },
      error: (error) => {
        if (error.status === 401 || error.status === 500) {
          this.loadCompleted = true;
        }
      }
    });
  }

  /**
   * Descarga el cierre de caja actual en formato PDF.
   */
  public downloadPDF(): void {
    this.downloadPDFService.downloadBalancesFile(this.balancesId);
  }

  /**
   * Calcula los totales (base, cuota, total, pmTotal)
   * en base a las líneas del cierre de caja.
   */
  private calculateTotals(): void {
    this.resetTotals();

    for (const balanceLine of this.balances.balanceLines) {
      const valueBase = balanceLine.base / Math.pow(10, balanceLine.decimals);
      const valueTax = balanceLine.tax / Math.pow(10, balanceLine.decimals);
      const valueTotal = balanceLine.total / Math.pow(10, balanceLine.decimals);

      this.base += valueBase;
      this.cuota += valueTax;

      if (balanceLine.itemType === BalanceLine.TYPE_TAX) {
        this.total += valueTotal;
      }
      if (balanceLine.itemType === BalanceLine.TYPE_PAYMENT_METHOD) {
        this.pmTotal += valueTotal;
      }
    }
  }

  /**
   * Reinicia todos los totales a cero.
   */
  private resetTotals(): void {
    this.base = 0;
    this.cuota = 0;
    this.total = 0;
    this.pmTotal = 0;
  }
}
