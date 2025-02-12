import { CashMovementsService } from '../_services/cash-movements.service';
import { OrdersService } from '../_services/orders.service';
import { Component, OnInit } from '@angular/core';
import { OrderAggregation } from '../_models/order-aggregation.model';
import { PortalUsersService } from '../_services/portal-users.service';
import { TerminalsService } from '../_services/terminals.service';
import { AuthService } from '../_services/auth.service';
import { Terminal } from '../_models/terminal.model';
import { CommercesService } from '../_services/commerces.service';
import { OrdersFilter } from '../_models/_filters/orders.filter';
import { CashMovementsFilter } from '../_models/_filters/cash-movements.filter';
import { EvolutionFilter } from '../_models/_filters/evolution.filter';
import { EvolutionCMFilter } from '../_models/_filters/evolution-cm.filter';
import { EvolutionResultsFilter } from '../_models/_filters/evolution-results.filter';
import { PaymentMethodsFilter } from '../_models/_filters/payment-methods.filter';
import { Top3Filter } from '../_models/_filters/top3.filter';
import { TopProductsFilter } from '../_models/_filters/top-products.filter';
import { StorageService } from '../_services/storage.service';

@Component({
  selector: 'DPOSW-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: [],
})
export class DashboardComponent implements OnInit {
  
  public loadedKPIChart:boolean = false;
  public loadedPMChart:boolean = false;
  public loadedTPChart:boolean = false;
  
  public terminalSelected: string = 'Todos';
  
  public ordersResult = { total: 0, count: 0 };
  public refundsResult = { total: 0, count: 0 };
  public rectificationsResult = { total: 0, count: 0 };
  public avTicketResult:number = 0;
  public cashMovementsResult:number = 0;
  public cashMovementsOperationsResult:number = 0;
  public balanceResult:number = 0;
  
  public showSalesVar:boolean = false;
  public showRefundsVar:boolean = false;
  public showAverageTicketVar:boolean = false;
  public showCashMovVar:boolean = false;
  public showResultsVar:boolean = false;
  
  public year:number = new Date().getFullYear();
  private yearVarSearch = '';
  private monthVarSearch = '';
  private yearDate:Date;
  private yearMilli:number = 0;
  private yearMaxDate:Date;
  private yearMaxMilli:number = 0;
  private dateMilli:number = 0;
  private dateMaxMilli:number = 0;
  private Math = Math;
  
  public terminalsNumber: string[];
  private terminals: Terminal[];
  private commerceId: number = 0;

  //Variables consulta API
  public aggregations: OrderAggregation[];
  private idOrders;
  private idCM;
  private idEvo;
  private idEvoCM;
  private idEvoResults;
  private idPM;
  private idT3;
  private idTP;

  private colors: string[] = ['#6DB9FF', 
            '#1FCC92',
            '#FF803C', 
            '#F598F5', 
            '#FF6E6E', 
            '#FFCC4D',
            '#7C77FE'];

  public kpiDataset = [
    { name: 'Ene', value: 0 },
    { name: 'Feb', value: 0 },
    { name: 'Mar', value: 0 },
    { name: 'Abr', value: 0 },
    { name: 'May', value: 0 },
    { name: 'Jun', value: 0 },
    { name: 'Jul', value: 0 },
    { name: 'Ago', value: 0 },
    { name: 'Sep', value: 0 },
    { name: 'Oct', value: 0 },
    { name: 'Nov', value: 0 },
    { name: 'Dic', value: 0 },
  ];

  public colorsKPI = [
    { name: 'Ene', value: this.colors[0] },
    { name: 'Feb', value: this.colors[0] },
    { name: 'Mar', value: this.colors[0] },
    { name: 'Abr', value: this.colors[0] },
    { name: 'May', value: this.colors[0] },
    { name: 'Jun', value: this.colors[0] },
    { name: 'Jul', value: this.colors[0] },
    { name: 'Ago', value: this.colors[0] },
    { name: 'Sep', value: this.colors[0] },
    { name: 'Oct', value: this.colors[0] },
    { name: 'Nov', value: this.colors[0] },
    { name: 'Dic', value: this.colors[0] },
  ];

  public datasetPM = [
    { name: 'Efectivo', value: 0 },
    { name: 'Tarjeta', value: 0 },
    { name: 'Vales', value: 0 },
    { name: 'Virtual', value: 0 },
    { name: 'Otros', value: 0 },
    { name: 'Bono Denda', value: 0 },
    { name: 'Rectificación', value: 0 },
  ];

  public colorsPM = [
    { name: 'Efectivo', value: this.colors[0] },
    { name: 'Tarjeta', value: this.colors[1] },
    { name: 'Vales', value: this.colors[2] },
    { name: 'Virtual', value: this.colors[3] },
    { name: 'Otros', value: this.colors[4] },
    { name: 'Bono Denda', value: this.colors[5] },
    { name: 'Rectificación', value: this.colors[6] },
  ];

  public datasetTop3 = [
    { name: '', value: 0 },
    { name: '', value: 0 },
    { name: '', value: 0 },
    { name: '', value: 0 },
  ];

  public colorsTop3 = [];

  constructor(
    private ordersService: OrdersService,
    private cashMovementsService: CashMovementsService,
    private portalUsersService: PortalUsersService,
    private terminalsService: TerminalsService,
    private commercesService: CommercesService,
    private storageService: StorageService,
    private authService: AuthService
  ) {
    this.formatCurrencyLabel = this.formatCurrencyLabel.bind(this);
  }

  /**
   * Función de inicialización al cargar la pantalla
   */
  public ngOnInit(): void {
    this.storageService.userInfo.subscribe((user) =>{
      this.commercesService.commerceId$.subscribe((commerceId) => {
        this.commerceId = commerceId;
        this.portalUsersService.getToken(user).subscribe({
          next: (portalUserToken)=> {
            this.authService.setPortalUsersToken(portalUserToken.token);
            this.terminalsService.getTerminalList().subscribe({
              next: (terminals) => {
                this.terminals = [];
                this.terminals = terminals.filter(terminal => terminal.commerceId == this.commerceId && terminal.terminalNumber != null);
                if(this.terminals.length != 0) {
                  this.terminalsNumber = this.terminals.map(terminal => terminal.terminalNumber);
                }
                this.terminalsNumber.unshift('Todos');
                this.terminalSelected = this.terminalsNumber[0];
                //inicializamos los filtros de las llamadas a la API
                this.idOrders = new OrdersFilter(this.terminalsNumber).idOrders;
                this.idCM = new CashMovementsFilter(this.terminalsNumber).idCashMovement;
                this.idEvo = new EvolutionFilter(this.terminalsNumber).idEvo;
                this.idEvoCM = new EvolutionCMFilter(this.terminalsNumber).idEvoCashMovement;
                this.idEvoResults = new EvolutionResultsFilter(this.terminalsNumber).idEvoResults;
                this.idPM = new PaymentMethodsFilter(this.terminalsNumber).idPaymentMethods;
                this.idT3 = new Top3Filter(this.terminalsNumber).idTop3;
                this.idTP = new TopProductsFilter(this.terminalsNumber).idTopProducts;
                
                this.getKPIs();
                this.getTop3Chart();
                this.getPaymentMethodsChart();
                this.printSalesEvoChart();
              },
              error: (error) => {
                console.error("Error Commerces: ", error);
              }
            });
          },
          error: (error) => {
            console.error("Error Portal user token", error);
          }
        });
      });
    });
  }

  /**
   * Función que añade el caracter % en el value del chart Top más vendidos
   */
  public formatPercentageLabel(value: any) {
    return value + '%';
  }

  /**
   * Función que solo muestra el value label en el gráfico de barras del mes que se ha seleccionado en el filtro
   */
  public formatCurrencyLabel = (value:any) => {
    this.monthVarSearch = (<HTMLInputElement>(document.getElementById('monthDate'))).value;
    if (this.monthVarSearch != 'Todos') {
      if (this.kpiDataset[+this.monthVarSearch - 1].value == value && value !=0) {
        value = value.toFixed(1) + '€';
      } else {
        value = null;
      }
    } else {
      if (value == 0) {
        value = null;
      } else {
        value = value.toFixed(1) + '€';
      }
    }
    this.monthVarSearch = null;
    return value;
  };

  /**
   * Función que varía el color de las barras del gráfico dependiendo del mes seleccionado (realza el mes seleccionado y diluye el del resto)
   */
  public barCustomColors() {
    this.colorsKPI = [];
    this.monthVarSearch = (<HTMLInputElement>(document.getElementById('monthDate'))).value;
    if (this.monthVarSearch != 'Todos') {
      for (let i = 0; i < this.kpiDataset.length; i++) {
        this.colorsKPI.push({ name: this.kpiDataset[i].name, value: this.colors[0] });
      }
    }
    this.monthVarSearch = null;
    return this.colorsKPI;
  }

  /**
   * Método de filtro de búsqueda, modifica los datos mostrados en el apartado de KPIs en tiempo real conforme se cambian en el HTML
   */
  public searchTerminal() {
    //Obtención de variables de búsqueda de año y mes
    this.yearVarSearch = (<HTMLInputElement>(document.getElementById('yearDate'))).value;
    this.monthVarSearch = (<HTMLInputElement>(document.getElementById('monthDate'))).value;
    //Se comprueba si es necesario filtrar por solo año o por año+mes, el if es el caso de solo año
    if (this.monthVarSearch.length == 0 || this.monthVarSearch == 'Todos') {
      //Se obtiene el año inicial (yearMilli) y el año máximo (yearMaxMilli) y se transforma a unicode
      this.yearDate = new Date(parseInt(this.yearVarSearch), 0);
      this.yearMilli = this.yearDate.getTime();
      this.yearMaxMilli = this.yearMilli + 31536000000;
      //Se actualizan las variables de búsqueda en el apartado de intervalo de fecha para enviar la consulta a la API
      this.idOrders[1].$match.created_at = {
        $gt: this.yearMilli,
        $lt: this.yearMaxMilli,
      };
      this.idCM[0].$match.created_at = {
        $gt: this.yearMilli,
        $lt: this.yearMaxMilli,
      };
      this.idPM[1].$match.created_at = {
        $gt: this.yearMilli,
        $lt: this.yearMaxMilli,
      };
      this.idT3[0].$match.created_at = {
        $gt: this.yearMilli,
        $lt: this.yearMaxMilli,
      };
      this.idTP[0].$match.created_at = {
        $gt: this.yearMilli,
        $lt: this.yearMaxMilli,
      };
    //En el else se contempla el caso de que la búsqueda se realice con año+mes
    } else {
      //Se obtienen las variables de fechas (inicial (dateMilli) y max (dateMaxMilli)) teniendo en cuenta la variable de búsqueda de año y mes, se pasan a unicode
      this.yearDate = new Date(parseInt(this.yearVarSearch), parseInt(this.monthVarSearch) - 1);
      this.dateMilli = this.yearDate.getTime();
      this.yearMaxDate = new Date(parseInt(this.yearVarSearch), parseInt(this.monthVarSearch));
      this.dateMaxMilli = this.yearMaxDate.getTime();
      //Se actualizan las variables de búsqueda en el apartado de intervalo de fecha para enviar la consulta a la API
      this.idOrders[1].$match.created_at = {
        $gt: this.dateMilli,
        $lt: this.dateMaxMilli,
      };
      this.idCM[0].$match.created_at = {
        $gt: this.dateMilli,
        $lt: this.dateMaxMilli,
      };
      this.idPM[1].$match.created_at = {
        $gt: this.dateMilli,
        $lt: this.dateMaxMilli,
      };
      this.idT3[0].$match.created_at = {
        $gt: this.dateMilli,
        $lt: this.dateMaxMilli,
      };
      this.idTP[0].$match.created_at = {
        $gt: this.dateMilli,
        $lt: this.dateMaxMilli,
      };
    }
    //Si se selecciona el valor "Todos", se establece con todos los números de terminal
    if (this.terminalSelected == 'Todos') {
      this.idOrders[1].$match.terminal_number = { $in: this.terminalsNumber };
      this.idCM[0].$match.terminal_number = { $in: this.terminalsNumber };
      this.idPM[1].$match.terminal_number = { $in: this.terminalsNumber };
      this.idT3[0].$match.terminal_number = { $in: this.terminalsNumber };
      this.idTP[0].$match.terminal_number = { $in: this.terminalsNumber };
    } else {
      this.idOrders[1].$match.terminal_number = this.terminalSelected;
      this.idCM[0].$match.terminal_number = this.terminalSelected;
      this.idPM[1].$match.terminal_number = this.terminalSelected;
      this.idT3[0].$match.terminal_number = this.terminalSelected;
      this.idTP[0].$match.terminal_number = this.terminalSelected;
    }

    this.getKPIs();
    this.getTop3Chart();
    this.getPaymentMethodsChart();
    this.fillCharKPIs(undefined);
  }

  //Método de dibujado de gráfico de evolución de KPI
  public fillCharKPIs(event: any) {
    this.loadedKPIChart = false;
    //Se captura el nombre del KPI en el que se clicka para mostrar el gráfico
    let idElement:string = 'sales'; 
    if(event != undefined) {
      let target = event.target as HTMLElement;
      idElement = target.id.slice(0, 5);
    }
    //Se atualiza la variable de búsqueda de terminal (en el if se establece el caso de todas las terminales y en el else el de terminal individual)
    if (this.terminalSelected == 'Todos') {
      this.idEvo[1].$match.terminal_number = { $in: this.terminalsNumber };
      this.idEvoCM[1].$match.terminal_number = { $in: this.terminalsNumber };
      this.idEvoResults[1].$match.terminal_number = { $in: this.terminalsNumber };
    } else {
      this.idEvo[1].$match.terminal_number = this.terminalSelected;
      this.idEvoCM[1].$match.terminal_number = this.terminalSelected;
      this.idEvoResults[1].$match.terminal_number = this.terminalSelected;
    }
    //Se actualiza la variable de búsqueda de intervalo de tiempo, en este caso solo se usa la de año ya que no se permite filtrar por mes
    this.yearVarSearch = (<HTMLInputElement>(document.getElementById('yearDate'))).value;
    this.yearDate = new Date(parseInt(this.yearVarSearch), 0);
    this.yearMilli = this.yearDate.getTime();
    this.yearMaxMilli = this.yearMilli + 31536000000;
    if (this.yearMilli && this.yearMaxMilli != 0) {
      this.idEvo[1].$match.created_at = {
        $gt: this.yearMilli,
        $lt: this.yearMaxMilli,
      };
      this.idEvoCM[1].$match.created_at = {
        $gt: this.yearMilli,
        $lt: this.yearMaxMilli,
      };
      this.idEvoResults[1].$match.created_at = {
        $gt: this.yearMilli,
        $lt: this.yearMaxMilli,
      };
    }
    //Segun el KPI seleccionado: se activa la variable de nombre escogida, se desactiva el resto,
    //y se dibuja el gráfico con los datos correspondientes
    switch (idElement) {
      case undefined:
      case 'sales':
        this.showSalesVar = true;
        this.showRefundsVar = false;
        this.showAverageTicketVar = false;
        this.showCashMovVar = false;
        this.showResultsVar = false;
        this.printSalesEvoChart();
        break;
      case 'avera':
        this.showSalesVar = false;
        this.showRefundsVar = false;
        this.showAverageTicketVar = true;
        this.showCashMovVar = false;
        this.showResultsVar = false;
        this.printAverageEvoChart();
        break;
      case 'refun':
        this.showSalesVar = false;
        this.showRefundsVar = true;
        this.showAverageTicketVar = false;
        this.showCashMovVar = false;
        this.showResultsVar = false;
        this.printRefundEvoChart();
        break;
      case 'casmo':
        this.showSalesVar = false;
        this.showRefundsVar = false;
        this.showAverageTicketVar = false;
        this.showCashMovVar = true;
        this.showResultsVar = false;
        this.printCMEvoChart();
        break;
      case 'balan':
        this.showSalesVar = false;
        this.showRefundsVar = false;
        this.showAverageTicketVar = false;
        this.showCashMovVar = false;
        this.showResultsVar = true;
        this.printBalancesEvoChart();
        break;
      default:
        this.loadedKPIChart = true;
        break;
    }
  }

  /**
   * Función para mostrar los datos de la evolución de las ventas
   */
  private printSalesEvoChart() {

    //Se establece el filtro de búsqueda de type en la variable a 0 para filtrar por operaciones de venta
    this.idEvo[1].$match.type = 0;
    //Se realiza la llamada a la API con la variable de búsqueda actualizada (terminal, intervalo de tiempo y tipo)
    this.ordersService.getOrderAggregate(this.idEvo).subscribe((aggregationsEvo) => {
        //Actualzamos los colores de las barras
        for (let i = 0; i < this.colorsKPI.length; i++) {
          this.colorsKPI[i].value = this.colors[0];
        }
        //Se inicializan los valores
        for (let i = 0; i < this.kpiDataset.length; i++) {
            this.kpiDataset[i].value = 0;
        }
        //Se rellena el array de datos del gráfico en el apartado value de cada elemento con el dato obtenido de la consulta
        for (let i = 0; i < aggregationsEvo.length; i++) {
          this.kpiDataset[aggregationsEvo[i]._id - 1].value = aggregationsEvo[i].total / 100;
        }
        //Se actualiza el array de datos del gráfico para que se dibujen los nuevos datos introducidos
        this.kpiDataset = [...this.kpiDataset];
        //Variables de carga de gráficos se ponen en true
        this.loadedKPIChart = true;
      }
    );
  }

  /**
   * Función para mostrar los datos de la evolución de las devoluciones
   */
  private printRefundEvoChart() {
    //Se establece el filtro de búsqueda de type en la variable a 2 para filtrar por operaciones de devolución
    this.idEvo[1].$match.type = 2;
    //Se realiza la llamada a la API con la variable de búsqueda actualizada (terminal, intervalo de tiempo y tipo)
    this.ordersService.getOrderAggregate(this.idEvo).subscribe((aggregationsEvo) => {
        //Actualzamos los colores de las barras
        for (let i = 0; i < this.colorsKPI.length; i++) {
          this.colorsKPI[i].value = this.colors[2];
        }
        //Se inicializan los valores del array
        for (let i = 0; i < this.kpiDataset.length; i++) {
            this.kpiDataset[i].value = 0;
        }
        //Se rellena el array de datos del gráfico en el apartado value de cada elemento con el dato obtenido de la consulta
        for (let i = 0; i < aggregationsEvo.length; i++) {
          this.kpiDataset[aggregationsEvo[i]._id - 1].value = aggregationsEvo[i].total / 100;
        }
        //Se actualiza el array de datos del gráfico para que se dibujen los nuevos datos introducidos
        this.kpiDataset = [...this.kpiDataset];
        //Variables de carga de gráficos se ponen en true
        this.loadedKPIChart = true;
      }
    );
  }

  /**
   * Función para mostrar los datos de la evolución del ticket medio
   */
  private printAverageEvoChart() {
    //Se establece el filtro de búsqueda de type en la variable a 0 para filtrar por operaciones de venta
    this.idEvo[1].$match.type = 0;
    //Se realiza la llamada a la API con la variable de búsqueda actualizada (terminal, intervalo de tiempo y tipo)
    this.ordersService.getOrderAggregate(this.idEvo).subscribe((aggregationsEvo) => {
        //Actualzamos los colores de las barras
        for (let i = 0; i < this.colorsKPI.length; i++) {
          this.colorsKPI[i].value = this.colors[1];
        }
        //Se inicializan los valores
        for (let i = 0; i < this.kpiDataset.length; i++) {
            this.kpiDataset[i].value = 0;
        }
        //Se rellena el array de datos del gráfico en el apartado value de cada elemento con el dato obtenido de la consulta
        for (let i = 0; i < aggregationsEvo.length; i++) {
          this.kpiDataset[aggregationsEvo[i]._id - 1].value = aggregationsEvo[i].avg / 100;
        }
        //Se actualiza el array de datos del gráfico para que se dibujen los nuevos datos introducidos
        this.kpiDataset = [...this.kpiDataset];
        //Variables de carga de gráficos se ponen en true
        this.loadedKPIChart = true;
      }
    );
  }

  /**
   * Función para mostrar los datos de la evolución de los movimientos de caja
   */
  private printCMEvoChart() {
    //Se inicializan los array de in y out donde se van a poner los datos de los movimientos de caja positivos y negativos
    let valueGraphArrayIn = new Array(12);
    let valueGraphArrayOut = new Array(12);
    //Se realiza la llamada a la API con la variable de búsqueda actualizada (terminal y intervalo de tiempo)
    this.cashMovementsService.getCashMovementsAggregate(this.idEvoCM).subscribe((aggregationsEvoIn) => {
      //Actualzamos los colores de las barras
      for (let i = 0; i < this.colorsKPI.length; i++) {
        this.colorsKPI[i].value = this.colors[3];
      }
      //Se inicializan los arrays
      for (let i = 0; i < this.kpiDataset.length; i++) {
          valueGraphArrayIn[i] = 0;
          valueGraphArrayOut[i] = 0;
          this.kpiDataset[i].value = 0;
      }
      //Se rellena el array de datos del gráfico en el apartado value de cada elemento con el dato obtenido de la consulta
      for (let i = 0; i < aggregationsEvoIn.length; i++) {
        //Se separan los datos dependiendo de su id (0 movimiento in en el if y 1 movimiento out en el else)
        if (aggregationsEvoIn[i]._id.type == 0) {
          valueGraphArrayIn[aggregationsEvoIn[i]._id.month - 1] = aggregationsEvoIn[i].total / 100;
        } else {
          valueGraphArrayOut[aggregationsEvoIn[i]._id.month - 1] = aggregationsEvoIn[i].total / 100;
        }
      }
      //Se rellena el array de datos del gráfico en el apartado value de cada elemento con la diferencia entre movimientos in y out
      for (let i = 0; i < this.kpiDataset.length; i++) {
        this.kpiDataset[i].value = valueGraphArrayIn[i] - valueGraphArrayOut[i];
      }
      //Se actualiza el array de datos del gráfico para que se dibujen los nuevos datos introducidos
      this.kpiDataset = [...this.kpiDataset];
      //Variables de carga de gráficos se ponen en true
      this.loadedKPIChart = true;
    });
  }

  /**
   * Función para mostrar los datos de la evolución de los cierres de caja
   */
  private printBalancesEvoChart() {
    let valueGraphArraySales = new Array(12);
    let valueGraphArrayRect = new Array(12);
    let valueGraphArrayRefunds = new Array(12);
    //Se realiza la llamada a la API con la variable de búsqueda actualizada (terminal, intervalo de tiempo y tipo)
    this.ordersService.getOrderAggregate(this.idEvoResults).subscribe((aggregationsEvoOrder) => {
      //Actualzamos los colores de las barras
      for (let i = 0; i < this.colorsKPI.length; i++) {
        this.colorsKPI[i].value = this.colors[4];
      }
      //Inicializamos los arrays
      for (let i = 0; i < this.kpiDataset.length; i++) {
          valueGraphArraySales[i] = 0;
          valueGraphArrayRefunds[i] = 0;
          valueGraphArrayRect[i] = 0;
          this.kpiDataset[i].value = 0;
      }
      let totalSales = 0;
      let totalRefunds = 0;
      let totalRectifications = 0;
      //Se clasifican los datos obtenidos según el tipo ( 0 ventas, 2 devoluciones y 5 rectificaciones) en el array de resultados
      for (let i = 0; i < aggregationsEvoOrder.length; i++) {
        switch (aggregationsEvoOrder[i]._id.type) {
          case 0:
            valueGraphArraySales[aggregationsEvoOrder[i]._id.month - 1] = aggregationsEvoOrder[i].total / 100;
            totalSales += aggregationsEvoOrder[i].total / 100;
            break;
          case 2:
            valueGraphArrayRefunds[aggregationsEvoOrder[i]._id.month - 1] = aggregationsEvoOrder[i].total / 100;
            totalRefunds += aggregationsEvoOrder[i].total / 100;
            break;
          case 5:
            valueGraphArrayRect[aggregationsEvoOrder[i]._id.month - 1] = aggregationsEvoOrder[i].total / 100;
            totalRectifications += aggregationsEvoOrder[i].total / 100;
            break;
        }
      }
      this.balanceResult = totalSales - (totalRefunds + totalRectifications);
      //Se actualizan los datos del array de resultados en el array de datos del gráfico para que se muestren los resultados (ventas - (devoluciones+rectificaciones))
      for (let i = 0; i < this.kpiDataset.length; i++) {
        this.kpiDataset[i].value = valueGraphArraySales[i] - (valueGraphArrayRefunds[i] + valueGraphArrayRect[i]);
      }
      //Se actualiza el array del gráfico para que se dibujen los datos nuevos en el gráfico
      this.kpiDataset = [...this.kpiDataset];
      //Las variables de carga de gráfico se ponen en true
      this.loadedKPIChart = true;
    });
  }

   /**
    * Función para mostrar los datos de todos los KPI 
    */
   private getKPIs() {
    //Llamada a la API para obtener los datos agregados de que se muestran en la sección KPIs de movimientos de caja
    this.cashMovementsService.getCashMovementsAggregate(this.idCM).subscribe(
      (aggregationsCM) => {
        this.cashMovementsResult = (aggregationsCM[0].total / Math.pow(10, aggregationsCM[0].decimals)) - (aggregationsCM[1].total / Math.pow(10, aggregationsCM[1].decimals));
        this.cashMovementsOperationsResult = aggregationsCM[0].count + aggregationsCM[1].count;
      }
    );
    //Comunicación con API para obtener los datos agregados que se muestran como base al iniciar la página en la sección de KPIs
    this.ordersService.getOrderAggregate(this.idOrders).subscribe(
      (aggregation) => {
        this.aggregations = aggregation;
        this.ordersResult = {total: 0, count: 0};
        this.refundsResult = {total: 0, count: 0};
        this.rectificationsResult = {total: 0, count: 0};
        this.avTicketResult = 0;
        this.balanceResult = 0;
        let countAvg = 0;
        //Bucle para recorrer el objeto respuesta
        for (let i = 0; i < this.aggregations.length; i++) {
          //If para comprobar si existen datos y el objeto no está vacio
          if (this.aggregations[i].total != null) {
            this.avTicketResult += this.aggregations[i].avg / 100;
            countAvg++;
            //Switch para comprobar si existen datos de ventas (id 0), de devoluciones (id 2) o rectificaciones (id 5)
            switch (this.aggregations[i]._id) {
              case 0: //Ventas
                //Para cada caso se rellena el array de resultados tanto del total con los decimales ya aplicados como del conteo de nº de operaciones
                this.ordersResult.total += this.aggregations[i].total / this.Math.pow(10, this.aggregations[i].decimals);
                this.ordersResult.count += this.aggregations[i].count;
                break;
              case 2: //Devoluciones
                this.refundsResult.total += this.aggregations[i].total / this.Math.pow(10, this.aggregations[i].decimals);
                this.refundsResult.count += this.aggregations[i].count;
                break;
              case 5: //Rectificaciones
                this.rectificationsResult.total += this.aggregations[i].total / this.Math.pow(10, this.aggregations[i].decimals);
                this.rectificationsResult.count += this.aggregations[i].count;
                break;
            }
          }
        }
        this.balanceResult = this.ordersResult.total - (this.refundsResult.total + this.rectificationsResult.total);
        this.avTicketResult = this.avTicketResult / countAvg;
      }
    );
  }

  /**
   * Función para mostrar los datos del gráfico de Top más vendidos
   */
  private getTop3Chart() {
    this.loadedTPChart = false;
    //Llamada a la API para obtener el total de productos vendidos
    this.ordersService.getOrderTop3Aggregate(this.idTP).subscribe(
      (aggregationsTP) => {
        //Llamada a la API para obtener los datos del gráfico de top 3 más vendidos
        this.ordersService.getOrderTop3Aggregate(this.idT3).subscribe(
          (aggregationsTop3) => {
            //Se asocian los datos del objeto respuesta con los campos correspondientes del array de valores del gráfico
            let sumaTP = 0;
            this.colorsTop3 = [];
            for (let i = 0; i < aggregationsTop3.length; i++) {
              sumaTP = sumaTP + aggregationsTop3[i].quantity;
              this.datasetTop3[i].name = aggregationsTop3[i].product + ' (' + aggregationsTop3[i].quantity + ' uds)';
              this.datasetTop3[i].value = Math.round((aggregationsTop3[i].quantity / aggregationsTP[0].quantity) * 100);
              this.colorsTop3.push({ name: this.datasetTop3[i].name, value: this.colors[i]});
            }
            //Se asocia el 4º puesto del array del gráfico correspondiente al apartado "resto de productos"
            //El dato se obtiene restando el valor total de la consulta de aggregationsTP a la sumaTP
            this.datasetTop3[3].name = 'Resto (' + (aggregationsTP[0].quantity - sumaTP) +' uds)';
            this.datasetTop3[3].value = Math.round(((aggregationsTP[0].quantity - sumaTP) / aggregationsTP[0].quantity) * 100);
            this.loadedTPChart = true;
          } 
        );
      }
    );
  }

  /**
   * Función para mostrar los datos del gráfico de métodos de pago
   */
  private getPaymentMethodsChart() {
    this.loadedPMChart = false;
    //Llamada a la API para obtener los métodos de pago
    this.ordersService.getOrderAggregate(this.idPM).subscribe((aggregationsPM) => {
        //Se reinicia el array de datos del gráfico
        for (let i = 0; i < this.datasetPM.length; i++) {
          this.datasetPM[i].value = 0;
        }
        //Se realiza la suma del número total de operaciones para, posteriormente, hacer el % de cada método de pago sobre el total
        let totalPM: number = 0;
        for (let i = 0; i < aggregationsPM.length; i++) {
          totalPM = totalPM + aggregationsPM[i].count;
        }
        //Se recorre el objeto respuesta
        for (let i = 0; i < aggregationsPM.length; i++) {
          //Se rellena el array que alimenta al gráfico con cada tipo de método de pago
          switch (aggregationsPM[i]._id) {
            case 'Tarjeta':
              this.datasetPM[1].value = Math.round((aggregationsPM[i].count / totalPM) * 100);
              this.datasetPM[1].name = 'Tarjeta';
              break;
            case 'Efectivo':
              this.datasetPM[0].value = Math.round((aggregationsPM[i].count / totalPM) * 100);
              this.datasetPM[0].name ='Efectivo';
              break;
            case 'Vales':
              this.datasetPM[2].value = Math.round((aggregationsPM[i].count / totalPM) * 100);
              this.datasetPM[2].name = 'Vales';
              break;
            case 'Virtual':
              this.datasetPM[3].value = Math.round((aggregationsPM[i].count / totalPM) * 100);
              this.datasetPM[3].name = 'Virtual';
              break;
            case 'Otros':
              this.datasetPM[4].value = Math.round((aggregationsPM[i].count / totalPM) * 100);
              this.datasetPM[4].name = 'Otros';
              break;
            case 'Bono Denda':
              this.datasetPM[5].value = Math.round((aggregationsPM[i].count / totalPM) * 100);
              this.datasetPM[5].name = 'Bono Denda';
              break;
            case 'Rectificación':
              this.datasetPM[6].value = Math.round((aggregationsPM[i].count / totalPM) * 100);
              this.datasetPM[6].name = 'Rectificación';
              break;
          }
        }
        //Para que se actualice el gráfico con los datos nuevos hay que reiniciar el array de datos
        this.datasetPM = [...this.datasetPM];
        //Variable de carga del gráfico se cambia a true
        this.loadedPMChart = true;
      }
    );
  }
}