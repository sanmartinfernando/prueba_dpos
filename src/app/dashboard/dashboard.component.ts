import { CashMovementsService } from '../_services/cash-movements.service';
import { OrdersService } from '../_services/orders.service';
import { ChangeDetectorRef, Component, ElementRef, HostListener, inject, OnInit, SimpleChanges, ViewChild, OnDestroy, OnChanges, AfterViewInit } from '@angular/core';
import { OrderAggregation } from '../_models/order-aggregation.model';
import { TerminalsService } from '../_services/terminals.service';
import { CommercesService } from '../_services/commerces.service';
import { OrdersFilter } from '../_models/_filters/orders.filter';
import { CashMovementsFilter } from '../_models/_filters/cash-movements.filter';
import { EvolutionFilter } from '../_models/_filters/evolution.filter';
import { EvolutionCMFilter } from '../_models/_filters/evolution-cm.filter';
import { EvolutionResultsFilter } from '../_models/_filters/evolution-results.filter';
import { PaymentMethodsFilter } from '../_models/_filters/payment-methods.filter';
import { Top3Filter } from '../_models/_filters/top3.filter';
import { TopProductsFilter } from '../_models/_filters/top-products.filter';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs/internal/Subscription';
import { DataSetTop3 } from '../_models/dataset-top3.model';
import { SessionService } from '../_services/session.service';
import { Top3Aggregation } from '../_models/top3-aggregation.model';
import { ThemeService } from '../_services/theme.service';
import { UIStateService } from '../_services/ui-state.service';
import { Order } from '../_models/order.model';
import { Commerce } from '../_models/commerce.model';
import { debounceTime, fromEvent } from 'rxjs';
import { Color } from '@swimlane/ngx-charts';
import { LegendPosition } from '@swimlane/ngx-charts';


/**
 * @class DashboardComponent
 * @description
 * Componente principal para la visualización de datos de KPIs,
 * métodos de pago y top de venta de productos.
 * Gestiona la obtención, filtrado y representación gráfica de la información.
 */
@Component({
  selector: 'app-dpos-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy, OnChanges, AfterViewInit {

  private ordersService = inject(OrdersService);
  private cashMovementsService = inject(CashMovementsService);
  private terminalsService = inject(TerminalsService);
  private commercesService = inject(CommercesService);
  public translate = inject(TranslateService);
  private sessionService = inject(SessionService);
  private themeService = inject(ThemeService);
  private uiStateService = inject(UIStateService);
  private cdr = inject(ChangeDetectorRef);

  private resizeSub!: Subscription;

  public loadedKPIChart = false;
  public loadedPMChart = false;
  public loadedTPChart = false;
  public emptyKPIChart = false;
  public emptyPMChart = false;
  public emptyTPChart = false;

  public terminalSelected: string;

  public ordersResult = { total: 0, count: 0 };
  public refundsResult = { total: 0, count: 0 };
  public rectificationsResult = { total: 0, count: 0 };
  public avTicketResult = 0;
  public cashMovementsResult = 0;
  public cashMovementsOperationsResult = 0;
  public balanceResult = 0;

  public showOperationsVar = false;
  public showRefundsVar = false;
  public showAverageTicketVar = false;
  public showCashMovVar = false;
  public showResultsVar = false;

  public year: number = new Date().getFullYear();
  private yearVarSearch = '';
  private monthVarSearch = '';
  private selectedMonthIndex = 0;
  private yearDate: Date;
  private yearMaxDate: Date;
  public terminalsNumber: string[];
  private commerceId: number;

  public aggregations: OrderAggregation[];
  private idOrders;
  private idCM;
  private idEvo;
  private idEvoCM;
  private idEvoResults;
  private idPM;
  private idT3;
  private idTP;

  private hexColorsKPI: string[] = [];
  private hexColorsPM: string[] = [];
  private hexColorsTop3: string[] = [];


  public datasetKPI = [];
  public datasetTop3: DataSetTop3[];
  public datasetPM = [
    { name: 'Efectivo', value: 0 },
    { name: 'Tarjeta', value: 0 },
    { name: 'Vales', value: 0 },
    { name: 'Virtual', value: 0 },
    { name: 'Otros', value: 0 },
    { name: 'Bono Denda', value: 0 },
    { name: 'Rectificación', value: 0 },
  ];

  public colorsKPI = [];
  public colorsPM = [];
  public colorsTop3 = [];
  schemePM: any = {
    domain: this.colorsPM.map(c => c.value)
  };

  currentLang: string;
  langSubscription: Subscription;

  @ViewChild('top3ChartContainer', { static: false }) top3ChartContainer!: ElementRef;
  @ViewChild('pmChartContainer', { static: false }) pmChartContainer!: ElementRef;
  @ViewChild('KPIChartContainer', { static: false }) KPIChartContainer!: ElementRef;

  // Tamaños configurables
  private readonly barHeight = 40;
  private readonly padding = 20;

  kpiView: [number, number] | null = null;
  top3View: [number, number] | null = null;
  pmView: [number, number] | null = [300, 200];

  containerWidthTop3 = 400;
  containerWidthPM = 400;

  showModal = false;
  modalTitle = '';
  modalMessage = '';

  isComercia = false;
  legendPosition: LegendPosition = LegendPosition.Below; 

  constructor() {

    this.themeService.loadTheme(this.sessionService.getItem(SessionService.RESELLER_NAME));
    this.uiStateService.setFormSelectEnabled(true);

    this.formatCurrencyLabel = this.formatCurrencyLabel.bind(this);
    this.currentLang = this.translate.currentLang || 'es';

    this.langSubscription = this.translate.onLangChange.subscribe(event => {
      this.currentLang = event.lang;
      if (this.terminalSelected === this.terminalsNumber[0]) {
        this.terminalSelected = this.translate.instant('dpos.filter.all');
      }
      if (this.selectedMonthIndex === 0) {
        this.monthVarSearch = this.translate.instant('dpos.filter.all');
      }
      this.terminalsNumber[0] = this.translate.instant('dpos.filter.all');
      this.searchTerminal();
    });
  }

  /**
   * Evento del ciclo de vida de Angular que se ejecuta al inicializar el componente.
   * Configura la vista, obtiene la información del usuario y carga los datos iniciales de comercios y terminales.
   */
  ngOnInit(): void {
    this.commercesService.getCommerceList().subscribe({
      next: (commerces) => {
        this.sessionService.getCommerceId().subscribe((commerceId) => {
          if (commerceId !== 0) {
            this.commerceId = commerceId;
          } else {
            this.commerceId = commerces[0].commerceId;
            this.sessionService.setItem(SessionService.COMMERCE_ID, this.commerceId);
          }

          this.isComercia = this.sessionService.getItem(SessionService.RESELLER_NAME) === Commerce.RESELLER_COMERCIA;
          if (this.isComercia) {
            this.hexColorsKPI = ['#40B3E4', '#40B3E4', '#40B3E4', '#40B3E4', '#40B3E4', '#40B3E4', '#40B3E4'];
            this.hexColorsPM = ['#40B3E4', '#7A9F3F', '#33658A', '#FFCC00', '#FF6F3C', '#00BFA6', '#7A7A7A'];
            this.hexColorsTop3 = ['#40B3E4', '#7A9F3F', '#33658A', '#FFCC00', '#FFCC00', '#FFCC00', '#FFCC00'];
          } else {
            this.hexColorsKPI = ['#6DB9FF', '#1FCC92', '#FF803C', '#F598F5', '#FF6E6E', '#FFCC4D', '#7C77FE'];
            this.hexColorsPM = ['#6DB9FF', '#1FCC92', '#FF803C', '#F598F5', '#FF6E6E', '#FFCC4D', '#7C77FE'];
            this.hexColorsTop3 = ['#6DB9FF', '#1FCC92', '#FF803C', '#F598F5', '#FF6E6E', '#FFCC4D', '#7C77FE'];
          }

          this.terminalsService.getTerminalList().subscribe({
            next: (terminals) => {
              terminals = terminals.filter(terminal => terminal.commerceId === this.commerceId && terminal.terminalNumber !== null);
              if (terminals.length !== 0) {
                this.terminalsNumber = terminals.map(terminal => terminal.terminalNumber);
              }
              this.terminalsNumber.unshift(this.translate.instant('dpos.filter.all'));
              if (this.sessionService.getItem(SessionService.TERMINAL_NUMBER) === null) {
                this.terminalSelected = this.terminalsNumber[0];
                this.sessionService.setItem(SessionService.TERMINAL_NUMBER, this.terminalSelected);
              } else {
                this.terminalSelected = this.sessionService.getItem(SessionService.TERMINAL_NUMBER);
              }
              this.searchTerminal();
            },
            error: (error) => {
              this.openModal(this.translate.instant('dpos.error.msg.general'), this.translate.instant('dpos.error.msg.service.terminals'));
              console.error("Error Terminals: ", error);
            }
          });
        });
      },
      error: (error) => {
        this.openModal(this.translate.instant('dpos.error.msg.general'), this.translate.instant('dpos.error.msg.service.commerces'));
        console.error("Error Commerces: ", error);
      }
    });
  }

  ngOnDestroy() {
    this.resizeSub?.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges) {
    // Recalcular tras cualquier cambio relevante:
    if (changes['datasetTop3'] || changes['datasetPM'] || changes['datasetKPI'] || changes['loadedTPChart'] || changes['loadedPMChart'] || changes['loadedKPIChart']) {
      this.recalcViewsSoon();
    }
  }

  ngAfterViewInit() {
    // Primer cálculo de tamaño de charts justo después del primer render
    this.recalcViewsSoon();
    // Recalcular en resize de ventana (con debounce)
    this.resizeSub = fromEvent(window, 'resize')
      .pipe(debounceTime(150))
      .subscribe(() => this.updateChartSizes());


    this.updatePMChartView();
    window.addEventListener('resize', () => this.updatePMChartView());
  }

  /**
   * Detecta el redimensionamiento de la ventana y actualiza las dimensiones de los gráficos.
   * 
   * @param event Evento de redimensionamiento de la ventana.
   */
  @HostListener('window:resize', ['$event'])
  onResize() {
    this.updateChartSizes();
  }

  /**
   * Formatea un valor numérico como porcentaje para etiquetas en gráficos.
   * 
   * @param value Valor numérico a formatear.
   * @returns Cadena con el valor en porcentaje.
   */
  public formatPercentageLabel(value: number): string {

    return value < 5 ? `${value}%` : `${value}%`;
  }
  public formatPercentageLabelHorizontal(value: number): string {
    return value < 5 ? `${value}%` : `${value}%`;
  }

  /**
   * Formatea un valor numérico como moneda en euros para etiquetas en gráficos.
   * Aplica el formato dependiendo del mes seleccionado.
   * 
   * @param value Valor numérico a formatear.
   * @returns Cadena con el valor formateado o null si no aplica.
   */
  public formatCurrencyLabel = (value: any) => {
    this.monthVarSearch = (document.getElementById('monthDate') as HTMLInputElement).value;
    if (this.monthVarSearch !== this.translate.instant('dpos.filter.all')) {
      if (this.datasetKPI[+this.monthVarSearch - 1].value === value && value !== 0) {
        value = value.toFixed(1) + '€';
      } else {
        value = null;
      }
    } else {
      if (value === 0) {
        value = null;
      } else {
        value = value.toFixed(1) + '€';
      }
    }
    this.monthVarSearch = null;
    return value;
  };

  /**
   * Ejecuta la búsqueda y actualización de datos en función del terminal, mes y año seleccionados.
   * Configura los filtros e invoca la carga de KPIs y gráficos.
   */
  public searchTerminal() {
    this.resetKpiDataset();
    this.resetColorsKPI();
    let fromDate = 0;
    let toDate = 0;
    let terminalsSelected: any;
    if (this.terminalSelected === this.translate.instant('dpos.filter.all')) {
      terminalsSelected = this.terminalsNumber.slice(1);
    } else {
      terminalsSelected = [this.terminalSelected];
    }
    this.yearVarSearch = (document.getElementById('yearDate') as HTMLInputElement).value;
    this.monthVarSearch = (document.getElementById('monthDate') as HTMLInputElement).value;
    if (this.selectedMonthIndex === 0) {
      this.yearDate = new Date(parseInt(this.yearVarSearch), 0);
      fromDate = this.yearDate.getTime();
      toDate = this.yearDate.getTime() + 31536000000;
    } else {
      this.yearDate = new Date(parseInt(this.yearVarSearch), parseInt(this.monthVarSearch) - 1);
      fromDate = this.yearDate.getTime();
      this.yearMaxDate = new Date(parseInt(this.yearVarSearch), parseInt(this.monthVarSearch));
      toDate = this.yearMaxDate.getTime();
    }

    this.idOrders = new OrdersFilter(this.commerceId, terminalsSelected, fromDate, toDate).idOrders;
    this.idCM = new CashMovementsFilter(this.commerceId, terminalsSelected, fromDate, toDate).idCashMovement;
    this.idEvo = new EvolutionFilter(this.commerceId, terminalsSelected, fromDate, toDate).idEvo;
    this.idEvoCM = new EvolutionCMFilter(this.commerceId, terminalsSelected, fromDate, toDate).idEvoCashMovement;
    this.idEvoResults = new EvolutionResultsFilter(this.commerceId, terminalsSelected, fromDate, toDate).idEvoResults;
    this.idPM = new PaymentMethodsFilter(this.commerceId, terminalsSelected, fromDate, toDate).idPaymentMethods;
    this.idT3 = new Top3Filter(this.commerceId, terminalsSelected, fromDate, toDate).idTop3;
    this.idTP = new TopProductsFilter(this.commerceId, terminalsSelected, fromDate, toDate).idTopProducts;

    this.getKPIs();
    this.getTop3Chart();
    this.getPaymentMethodsChart();
    this.fillCharKPIs(undefined);
  }

  /**
   * Cambia el tipo de KPI mostrado en función del botón pulsado y carga el gráfico correspondiente.
   * 
   * @param event Evento del clic del usuario.
   */
  public fillCharKPIs(event: MouseEvent) {

    this.loadedKPIChart = false;
    this.emptyKPIChart = true;
    let idElement = 'operations';
    if (event !== undefined) {
      const target = event.target as HTMLElement;
      idElement = target.id.slice(0, 5);
    }
    switch (idElement) {
      case undefined:
      default:
      case 'operations':
        this.showOperationsVar = true;
        this.showRefundsVar = false;
        this.showAverageTicketVar = false;
        this.showCashMovVar = false;
        this.showResultsVar = false;
        this.printOperationsEvoChart();
        break;
      case 'avera':
        this.showOperationsVar = false;
        this.showRefundsVar = false;
        this.showAverageTicketVar = true;
        this.showCashMovVar = false;
        this.showResultsVar = false;
        this.printAverageEvoChart();
        break;
      case 'refun':
        this.showOperationsVar = false;
        this.showRefundsVar = true;
        this.showAverageTicketVar = false;
        this.showCashMovVar = false;
        this.showResultsVar = false;
        this.printRefundEvoChart();
        break;
      case 'casmo':
        this.showOperationsVar = false;
        this.showRefundsVar = false;
        this.showAverageTicketVar = false;
        this.showCashMovVar = true;
        this.showResultsVar = false;
        this.printCMEvoChart();
        break;
      case 'balan':
        this.showOperationsVar = false;
        this.showRefundsVar = false;
        this.showAverageTicketVar = false;
        this.showCashMovVar = false;
        this.showResultsVar = true;
        this.printBalancesEvoChart();
        break;
    }
  }

  /**
   * Actualiza en sesión el terminal seleccionado.
   */
  public onTerminalChange(): void {
    this.sessionService.setItem(SessionService.TERMINAL_NUMBER, this.terminalSelected);
  }

  /**
   * Actualiza el índice del mes seleccionado.
   * 
   * @param event Evento de cambio en el elemento select.
   */
  public onMonthChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.selectedMonthIndex = selectElement.selectedIndex;
  }

  /**
   * Formatea las etiquetas de datos en gráficos a dos decimales si el valor es positivo.
   * 
   * @param value Valor numérico a formatear.
   * @returns Cadena con el valor formateado o vacío si es cero o negativo.
   */
  public dataLabelFormatting(value: any): string {
    if (value <= 0) return "";
    return value.toFixed(2);
  }

  /**
   * Abre el modal de mensajes estableciendo el título y el mensaje.
   *
   * @param title   Texto que se mostrará como título del modal.
   * @param message Texto que se mostrará como contenido del modal.
   */
  public openModal(title: string, message: string) {
    this.modalTitle = title;
    this.modalMessage = message;
    this.showModal = true;
  }

  /**
   * Cierra el modal de mensajes.
   */
  public closeModal() {
    this.showModal = false;
  }

  private recalcViewsSoon() {
    // Microtarea -> siguiente frame -> entonces medir
    Promise.resolve().then(() => {
      requestAnimationFrame(() => {
        this.updateChartSizes();
        // Forzamos un detectChanges para que el *ngIf vea el nuevo view en el mismo frame
        this.cdr.detectChanges();
      });
    });
  }

  private updateChartSizes() {
    if (this.top3ChartContainer) {
      const width = this.top3ChartContainer.nativeElement.offsetWidth;
      const height = this.datasetTop3.length * this.barHeight + this.padding;
      this.top3View = [width, height];
    }

    /*  if (this.pmChartContainer) {
       const width = 400; // fijas un ancho constante para el pie/donut
       const height = 200; // fijas un alto constante más grande para el pie/donut
       this.pmView = [width, height];
     } */
    if (this.KPIChartContainer) {
      const width = this.KPIChartContainer.nativeElement.offsetWidth;
      const height = 300;
      this.kpiView = [width, height];
    }
  }

  private updatePMChartView(): void {
    if (!this.pmChartContainer) return;

    const width = this.pmChartContainer.nativeElement.offsetWidth;
    const height = Math.max(width * 0.6, 250); // proporción 3:2 mínima 250px

    this.pmView = [width, height];
  }

  /**
   * Carga y muestra el gráfico de evolución de ventas.
   */
  private printOperationsEvoChart() {
    this.idEvo[1].$match.type = 0;
    for (const color of this.colorsKPI) {
      color.value = this.hexColorsKPI[0];
    }
    this.resetKpiDataset();
    this.ordersService.getOrderAggregate(this.idEvo).subscribe((aggregationsEvo) => {
      if (aggregationsEvo.length !== 0) {
        for (const aggregation of aggregationsEvo) {
          this.datasetKPI[aggregation._id - 1].value = aggregation.total / 100;
        }
        this.datasetKPI = [...this.datasetKPI];
        this.loadedKPIChart = true;
        this.emptyKPIChart = false;
      } else {
        this.loadedKPIChart = true;
        this.emptyKPIChart = true;
      }
    });
  }

  /**
   * Carga y muestra el gráfico de evolución de devoluciones.
   */
  private printRefundEvoChart() {
    this.idEvo[1].$match.type = 2;
    this.ordersService.getOrderAggregate(this.idEvo).subscribe((aggregationsEvo) => {
      if (aggregationsEvo.length !== 0) {
        this.colorsKPI.forEach(color => {
          color.value = this.hexColorsKPI[2];
        });
        this.resetKpiDataset();
        for (const aggregation of aggregationsEvo) {
          this.datasetKPI[aggregation._id - 1].value = aggregation.total / 100;
        }
        this.datasetKPI = [...this.datasetKPI];
        this.loadedKPIChart = true;
        this.emptyKPIChart = false;
      } else {
        this.loadedKPIChart = true;
        this.emptyKPIChart = true;
      }
    });
  }

  /**
   * Carga y muestra el gráfico de evolución del ticket medio.
   */
  private printAverageEvoChart() {
    this.idEvo[1].$match.type = 0;
    this.ordersService.getOrderAggregate(this.idEvo).subscribe((aggregationsEvo) => {
      if (aggregationsEvo.length !== 0) {
        this.colorsKPI.forEach(color => {
          color.value = this.hexColorsKPI[1];
        });
        this.resetKpiDataset();
        for (const aggregation of aggregationsEvo) {
          this.datasetKPI[aggregation._id - 1].value = aggregation.avg / 100;
        }
        this.datasetKPI = [...this.datasetKPI];
        this.loadedKPIChart = true;
        this.emptyKPIChart = false;
      } else {
        this.loadedKPIChart = true;
        this.emptyKPIChart = true;
      }
    });
  }

  /**
   * Carga y muestra el gráfico de evolución de movimientos de caja.
   * Calcula la diferencia entre entradas y salidas de caja por mes.
   */
  private printCMEvoChart() {
    const valueGraphArrayIn = new Array(12);
    const valueGraphArrayOut = new Array(12);
    this.cashMovementsService.getCashMovementsAggregate(this.idEvoCM).subscribe((aggregationsEvoIn) => {
      if (aggregationsEvoIn.length !== 0) {
        this.colorsKPI.forEach(color => {
          color.value = this.hexColorsKPI[3];
        });
        this.resetKpiDataset();
        for (let i = 0; i < this.datasetKPI.length; i++) {
          valueGraphArrayIn[i] = 0;
          valueGraphArrayOut[i] = 0;
        }
        for (const aggregation of aggregationsEvoIn) {
          if (aggregation._id.type === 0) {
            valueGraphArrayIn[aggregation._id.month - 1] = aggregation.total / 100;
          } else {
            valueGraphArrayOut[aggregation._id.month - 1] = aggregation.total / 100;
          }
        }
        for (let i = 0; i < this.datasetKPI.length; i++) {
          this.datasetKPI[i].value = valueGraphArrayIn[i] - valueGraphArrayOut[i];
        }
        this.datasetKPI = [...this.datasetKPI];
        this.loadedKPIChart = true;
        this.emptyKPIChart = false;
      } else {
        this.loadedKPIChart = true;
        this.emptyKPIChart = true;
      }
    });
  }

  /**
   * Carga y muestra el gráfico de evolución de cierres de caja.
   */
  private printBalancesEvoChart() {
    const valueGraphArrayIn: number[] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    const valueGraphArrayOut: number[] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    const valueArrayCashMovements: number[] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    this.cashMovementsService.getCashMovementsAggregate(this.idEvoCM).subscribe((aggregationsEvoIn) => {
      if (aggregationsEvoIn.length !== 0) {
        for (const aggregation of aggregationsEvoIn) {
          if (aggregation._id.type === 0) {
            valueGraphArrayIn[aggregation._id.month - 1] = aggregation.total / 100;
          } else {
            valueGraphArrayOut[aggregation._id.month - 1] = aggregation.total / 100;
          }
        }
        for (let i = 0; i < this.datasetKPI.length; i++) {
          valueArrayCashMovements[i] = valueGraphArrayIn[i] - valueGraphArrayOut[i];
        }
      }
      const valueGraphArrayOperations = new Array(12);
      const valueGraphArrayRefunds = new Array(12);
      this.ordersService.getOrderAggregate(this.idEvoResults).subscribe((aggregationsEvoOrder) => {
        if (aggregationsEvoOrder.length !== 0) {
          this.colorsKPI.forEach(color => {
            color.value = this.hexColorsKPI[4];
          });
          this.resetKpiDataset();
          for (let i = 0; i < this.datasetKPI.length; i++) {
            valueGraphArrayOperations[i] = 0;
            valueGraphArrayRefunds[i] = 0;
          }
          for (const aggregation of aggregationsEvoOrder) {
            switch (aggregation._id.type) {
              case Order.TYPE_SALE:
                valueGraphArrayOperations[aggregation._id.month - 1] = aggregation.total / 100;
                break;
              case Order.TYPE_REFUND:
                valueGraphArrayRefunds[aggregation._id.month - 1] = aggregation.total / 100;
                break;
            }
          }
          for (let i = 0; i < this.datasetKPI.length; i++) {
            this.datasetKPI[i].value = valueGraphArrayOperations[i] - valueGraphArrayRefunds[i] + valueArrayCashMovements[i];
          }
          this.datasetKPI = [...this.datasetKPI];
          this.loadedKPIChart = true;
          this.emptyKPIChart = false;
        } else {
          this.loadedKPIChart = true;
          this.emptyKPIChart = true;
        }
      });
    });
  }

  /**
   * Obtiene y calcula los principales indicadores KPI 
   * (ventas, ticket medio, devoluciones, movimientos de caja y cierres de caja).
   */
  private getKPIs() {
    this.cashMovementsResult = 0;
    this.cashMovementsOperationsResult = 0;
    this.ordersResult = { total: 0, count: 0 };
    this.refundsResult = { total: 0, count: 0 };
    this.rectificationsResult = { total: 0, count: 0 };
    this.avTicketResult = 0;
    this.balanceResult = 0;
    this.cashMovementsService.getCashMovementsAggregate(this.idCM).subscribe(
      (aggregationsCM) => {
        let inTotal = 0;
        let inDecimals = 0;
        let inCount = 0;
        let ouTotal = 0;
        let outDecimals = 0;
        let outCount = 0;
        for (const cashMovement of aggregationsCM) {
          if (cashMovement._id === 0) {
            inTotal = cashMovement.total;
            inDecimals = cashMovement.decimals;
            inCount = cashMovement.count;
          } else if (cashMovement._id === 1) {
            ouTotal = cashMovement.total;
            outDecimals = cashMovement.decimals;
            outCount = cashMovement.count;
          }
        }

        this.cashMovementsResult = (inTotal / Math.pow(10, inDecimals)) - (ouTotal / Math.pow(10, outDecimals));
        this.cashMovementsOperationsResult = inCount + outCount;
        this.ordersService.getOrderAggregate(this.idOrders).subscribe(
          (aggregation) => {
            if (aggregation.length !== 0) {
              this.aggregations = aggregation;
              for (const aggregation of this.aggregations) {
                if (aggregation.total !== null) {
                  switch (aggregation._id) {
                    case Order.TYPE_SALE:
                      this.ordersResult.total += aggregation.total / Math.pow(10, aggregation.decimals);
                      this.ordersResult.count += aggregation.count;
                      this.avTicketResult += aggregation.avg / 100;
                      break;
                    case Order.TYPE_REFUND:
                      this.refundsResult.total += aggregation.total / Math.pow(10, aggregation.decimals);
                      this.refundsResult.count += aggregation.count;
                      break;
                    case Order.TYPE_RECTIFY:
                      this.rectificationsResult.total += aggregation.total / Math.pow(10, aggregation.decimals);
                      this.rectificationsResult.count += aggregation.count;
                      break;
                  }
                }
              }
              this.balanceResult = this.ordersResult.total - this.refundsResult.total + this.cashMovementsResult;
            }
          }
        );
      }
    );
  }

  /**
   * Obtiene y prepara los datos para el gráfico del Top 3 de productos más vendidos.
   */
  private getTop3Chart() {
    this.loadedTPChart = false;
    this.emptyTPChart = true;
    this.ordersService.getOrderTop3Aggregate(this.idTP).subscribe(
      (aggregationsTP) => {
        if (aggregationsTP.length !== 0) {
          this.ordersService.getOrderTop3Aggregate(this.idT3).subscribe(
            (aggregationsTop3) => {
              let sumaTP = 0;
              this.colorsTop3 = [];
              this.datasetTop3 = [];
              let top3: Top3Aggregation[] = [];
              let totalQuantity = 0;
              if (aggregationsTop3 !== null) {
                aggregationsTop3.forEach(item => {
                  if (item.unitsMeasurement === 0) {
                    item.quantity = item.quantity * 1000;
                  }
                  totalQuantity += item.quantity;
                });
                top3 = aggregationsTop3.sort((a, b) => b.quantity - a.quantity).slice(0, 3);
              }
              for (let i = 0; i < top3.length; i++) {
                sumaTP = sumaTP + top3[i].quantity;
                let quantityValue = "";
                const quantity: number = top3[i].quantity / 1000;
                if (top3[i].unitsMeasurement === 1) {
                  quantityValue = quantity + "kg";
                } else if (top3[i].unitsMeasurement === 2) {
                  quantityValue = quantity + "m";
                } else if (top3[i].unitsMeasurement === 3) {
                  quantityValue = quantity + "l";
                } else {
                  quantityValue = quantity + "uds";
                }
                const dataName: string = top3[i].product + ' (' + quantityValue + ')';
                const dataValue: number = Math.round((top3[i].quantity / totalQuantity) * 100);
                this.colorsTop3.push({ name: dataName, value: this.hexColorsTop3[i] });
                const data = new DataSetTop3(dataName, dataValue);
                this.datasetTop3.push(data);
              }

              if (this.datasetTop3.length >= 3) {
                const dataName: string = 'Resto (' + (totalQuantity - sumaTP) / 1000 + ' uds)';
                const dataValue: number = Math.round(((totalQuantity - sumaTP) / totalQuantity) * 100);
                this.colorsTop3.push({ name: dataName, value: this.hexColorsTop3[4] });
                const data = new DataSetTop3(dataName, dataValue);
                this.datasetTop3.push(data);
              }

              this.datasetTop3 = [...this.datasetTop3];
              this.recalcViewsSoon();
              this.loadedTPChart = true;
              this.emptyTPChart = false;
            }
          );
        } else {
          this.loadedTPChart = true;
          this.emptyTPChart = true;
        }
      }
    );
  }

  /**
   * Obtiene y prepara los datos para el gráfico de métodos de pago utilizados.
   */
  private getPaymentMethodsChart() {
    this.loadedPMChart = false;
    this.emptyPMChart = false;
    this.ordersService.getOrderAggregate(this.idPM).subscribe((aggregationsPM) => {
      if (aggregationsPM.length !== 0) {
        this.datasetPM.forEach(item => {
          item.value = 0;
        });
        let totalPM = 0;
        for (const aggregation of aggregationsPM) {
          totalPM += aggregation.count;
        }
        for (const aggregation of aggregationsPM) {
          switch (aggregation._id) {
            case 'Tarjeta':
              this.datasetPM[1].value = Math.round((aggregation.count / totalPM) * 100);
              this.datasetPM[1].name = 'Tarjeta';
              break;
            case 'Efectivo':
              this.datasetPM[0].value = Math.round((aggregation.count / totalPM) * 100);
              this.datasetPM[0].name = 'Efectivo';
              break;
            case 'Vales':
              this.datasetPM[2].value = Math.round((aggregation.count / totalPM) * 100);
              this.datasetPM[2].name = 'Vales';
              break;
            case 'Virtual':
              this.datasetPM[3].value = Math.round((aggregation.count / totalPM) * 100);
              this.datasetPM[3].name = 'Virtual';
              break;
            case 'Otros':
              this.datasetPM[4].value = Math.round((aggregation.count / totalPM) * 100);
              this.datasetPM[4].name = 'Otros';
              break;
            case 'Bono Denda':
              this.datasetPM[5].value = Math.round((aggregation.count / totalPM) * 100);
              this.datasetPM[5].name = 'Bono Denda';
              break;
            case 'Rectificación':
              this.datasetPM[6].value = Math.round((aggregation.count / totalPM) * 100);
              this.datasetPM[6].name = 'Rectificación';
              break;
          }
        }

        this.colorsPM = [
          { name: 'Efectivo', value: this.hexColorsPM[0] },
          { name: 'Tarjeta', value: this.hexColorsPM[1] },
          { name: 'Vales', value: this.hexColorsPM[2] },
          { name: 'Virtual', value: this.hexColorsPM[3] },
          { name: 'Otros', value: this.hexColorsPM[4] },
          { name: 'Bono Denda', value: this.hexColorsPM[5] },
          { name: 'Rectificación', value: this.hexColorsPM[6] },
        ];

        this.schemePM = {
          domain: this.colorsPM.map(c => c.value),
        };

        this.datasetPM = [...this.datasetPM].filter(item => item.value > 0);
        this.recalcViewsSoon();
        this.loadedPMChart = true;
        this.emptyPMChart = false;
      } else {
        this.loadedPMChart = true;
        this.emptyPMChart = true;
      }
    });
  }

  /**
   * Inicializa el dataset de KPIs con valores en cero para cada mes.
   */
  private resetKpiDataset() {
    this.datasetKPI = [
      { name: this.translate.instant('dpos.month.enero'), value: 0 },
      { name: this.translate.instant('dpos.month.febrero'), value: 0 },
      { name: this.translate.instant('dpos.month.marzo'), value: 0 },
      { name: this.translate.instant('dpos.month.abril'), value: 0 },
      { name: this.translate.instant('dpos.month.mayo'), value: 0 },
      { name: this.translate.instant('dpos.month.junio'), value: 0 },
      { name: this.translate.instant('dpos.month.julio'), value: 0 },
      { name: this.translate.instant('dpos.month.agosto'), value: 0 },
      { name: this.translate.instant('dpos.month.septiembre'), value: 0 },
      { name: this.translate.instant('dpos.month.octubre'), value: 0 },
      { name: this.translate.instant('dpos.month.noviembre'), value: 0 },
      { name: this.translate.instant('dpos.month.diciembre'), value: 0 },
    ];
  }

  /**
   * Inicializa la paleta de colores para los KPIs con el color por defecto.
   */
  private resetColorsKPI() {
    this.colorsKPI = [
      { name: this.translate.instant('dpos.month.enero'), value: this.hexColorsKPI[0] },
      { name: this.translate.instant('dpos.month.febrero'), value: this.hexColorsKPI[0] },
      { name: this.translate.instant('dpos.month.marzo'), value: this.hexColorsKPI[0] },
      { name: this.translate.instant('dpos.month.abril'), value: this.hexColorsKPI[0] },
      { name: this.translate.instant('dpos.month.mayo'), value: this.hexColorsKPI[0] },
      { name: this.translate.instant('dpos.month.junio'), value: this.hexColorsKPI[0] },
      { name: this.translate.instant('dpos.month.julio'), value: this.hexColorsKPI[0] },
      { name: this.translate.instant('dpos.month.agosto'), value: this.hexColorsKPI[0] },
      { name: this.translate.instant('dpos.month.septiembre'), value: this.hexColorsKPI[0] },
      { name: this.translate.instant('dpos.month.octubre'), value: this.hexColorsKPI[0] },
      { name: this.translate.instant('dpos.month.noviembre'), value: this.hexColorsKPI[0] },
      { name: this.translate.instant('dpos.month.diciembre'), value: this.hexColorsKPI[0] },
    ];
  }



}