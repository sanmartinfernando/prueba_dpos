import { CashmovementsAggregateService } from './../_services/cashmovements-aggregate.service';
import { OrdersAggregateService } from './../_services/orders-aggregate.service';
import { Component, OnInit } from '@angular/core';
import { OrderAggregation } from '../_models/Orderaggregation.model';
import { OrderAggregationCash } from '../_models/OrderAggregationCash.model';
import { OrderAggregationTop3 } from '../_models/Top3Sales.model';

@Component({
  selector: 'DPOSW-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: [],
})
export class DashboardComponent implements OnInit {

  constructor(
    private OrdersAggregateService: OrdersAggregateService,
    private CashmovementsAggregateService: CashmovementsAggregateService
  ) {
    this.formatCurrencyLabel = this.formatCurrencyLabel.bind(this);
  }

  loadedKPIChart = false;
  loadedPMChart = false;
  loadedTPChart = false;

  target;
  idElement;
  terminalVarSearch: any = 'Todos';
  yearVarSearch = '';
  monthVarSearch = '';
  yearDate;
  monthDate;
  year = new Date().getFullYear();
  yearMilli = 0;
  yearMaxDate;
  yearMaxMilli = 0;
  dateMilli = 0;
  dateMaxMilli = 0;
  Math = Math;

  ordersResult = { total: 0, count: 0 };
  refundsResult = { total: 0, count: 0 };
  rectificationsResult = { total: 0, count: 0 };

  //Variables consulta API
  aggregations: OrderAggregation[];
  aggregationsPM: OrderAggregation[];
  aggregationsCM: OrderAggregation[];
  aggregationsEvo: OrderAggregation[];
  aggregationsEvoOrder: OrderAggregationCash[];
  aggregationsEvoIn: OrderAggregationCash[];
  aggregationsTop3: OrderAggregationTop3[];
  
  //Variables selección de dato para kpi
  showSalesVar = false;
  showRefundsVar = false;
  showAverageTicketVar = false;
  showCashMovVar = false;
  showResultsVar = false;
  
  //Variable de creación de gráficos
  valueGraphArrayIn = new Array(12);
  valueGraphArrayOut = new Array(12);
  valueGraphArraySales = new Array(12);
  valueGraphArrayRefunds = new Array(12);
  valueGraphArrayRect = new Array(12);

  colors = ['#6DB9FF', 
            '#1FCC92',
            '#FF803C', 
            '#F598F5', 
            '#FF6E6E', 
            '#FFCC4D',
            '#7C77FE'];

  kpiDataset = [
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

  colorsKPI = [
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

  datasetPM = [
    { name: 'Efectivo', value: 0 },
    { name: 'Tarjeta', value: 0 },
    { name: 'Vales', value: 0 },
    { name: 'Virtual', value: 0 },
    { name: 'Otros', value: 0 },
    { name: 'Bono Denda', value: 0 },
    { name: 'Rectificación', value: 0 },
  ];

  colorsPM = [
    { name: 'Efectivo', value: this.colors[0] },
    { name: 'Tarjeta', value: this.colors[1] },
    { name: 'Vales', value: this.colors[2] },
    { name: 'Virtual', value: this.colors[3] },
    { name: 'Otros', value: this.colors[4] },
    { name: 'Bono Denda', value: this.colors[5] },
    { name: 'Rectificación', value: this.colors[6] },
  ];

  datasetTop3 = [
    { name: '', value: 0 },
    { name: '', value: 0 },
    { name: '', value: 0 },
    { name: '', value: 0 },
  ];

  colorsTop3 = [];

  //Variable aggregation orders
  idOrders = [
    {
      $unwind: '$order_payments',
    },
    {
      $match: {
        terminal_number: { $in: ['1', '2'] },
        created_at: { $gt: 1704063600000, $lt: 1735686000000 },
      },
    },
    {
      $group: {
        _id: '$type',
        count: {
          $sum: 1,
        },
        avg: {
          $avg: '$total',
        },
        total: {
          $sum: '$total',
        },
        decimals: {
          $first: '$decimals',
        },
      },
    },
  ];

  //Variable aggregation cashmovement
  idCM = [
    {
      $match: {
        terminal_number: { $in: ['1', '2'] },
        created_at: { $gt: 1704063600000, $lt: 1735686000000 },
      },
    },
    {
      $group: {
        _id: '$type',
        count: {
          $sum: 1,
        },
        total: {
          $sum: '$amount',
        },
        decimals: { $first: '$decimals' },
      },
    },
  ];

  //Variable evolución
  IdEvo = [
    {
      $addFields: {
        created_at_formatted: {
          $toDate: '$created_at',
        },
      },
    },
    {
      $match: {
        terminal_number: { $in: ['1', '2'] },
        type: 0,
        created_at: { $gt: 1704063600000, $lt: 1735686000000 },
      },
    },
    {
      $group: {
        _id: {
          $month: '$created_at_formatted',
        },
        total: {
          $sum: '$total',
        },
        avg: {
          $avg: '$total',
        },
        count: {
          $sum: 1,
        },
        created_at: { $first: '$created_at' },
        created_at_formatted: { $first: '$created_at_formatted' },
      },
    },
    {
      $sort: {
        _id: 1,
      },
    },
  ];

  //Variable evolución Cash movements
  idEvoCM = [
    {
      $addFields: {
        created_at_formatted: {
          $toDate: '$created_at',
        },
      },
    },
    {
      $match: {
        terminal_number: { $in: ['1', '2'] },
        created_at: { $gt: 1704063600000, $lt: 1735686000000 },
      },
    },
    {
      $group: {
        _id: {
          month: {
            $month: '$created_at_formatted',
          },
          type: '$type',
        },
        total: {
          $sum: '$amount',
        },
        avg: {
          $avg: '$amount',
        },
        count: {
          $sum: 1,
        },
        created_at: {
          $first: '$created_at',
        },
        created_at_formatted: {
          $first: '$created_at_formatted',
        },
      },
    },
    {
      $sort: {
        _id: 1,
      },
    },
  ];

  //Variable evolución Results
  IdEvoResults = [
    {
      $addFields: {
        created_at_formatted: {
          $toDate: '$created_at',
        },
      },
    },
    {
      $match: {
        terminal_number: { $in: ['1', '2'] },
        created_at: { $gt: 1704063600000, $lt: 1735686000000 },
      },
    },
    {
      $group: {
        _id: {
          month: {
            $month: '$created_at_formatted',
          },
          type: '$type',
        },
        total: {
          $sum: '$total',
        },
        avg: {
          $avg: '$total',
        },
        count: {
          $sum: 1,
        },
        created_at: { $first: '$created_at' },
        created_at_formatted: { $first: '$created_at_formatted' },
      },
    },
    {
      $sort: {
        _id: 1,
      },
    },
  ];

  //Variable métodos de pago
  idPM = [
    {
      $unwind: '$order_payments',
    },
    {
      $match: {
        terminal_number: { $in: ['1', '2'] },
        created_at: { $gt: 1704063600000, $lt: 1735686000000 },
      },
    },
    {
      $group: {
        _id: '$order_payments.name',
        count: {
          $sum: 1,
        },
      },
    },
  ];

  //Variable top 3 productos vendidos
  idT3 = [
    {
      $match: {
        terminal_number: { $in: ['1', '2'] },
        created_at: { $gt: 1704063600000, $lt: 1735686000000 },
        type: 0,
      },
    },
    {
      $unwind: '$order_lines',
    },
    {
      $group: {
        _id: '$order_lines.product_name',
        quantity: {
          $sum: '$order_lines.quantity',
        },
        product: {
          $first: '$order_lines.product_name',
        },
      },
    },
    {
      $sort: {
        quantity: -1,
      },
    },
    {
      $limit: 3,
    },
  ];

  //Variable de búsqueda para total de productos vendidos
  idTP = [
    {
      $match: {
        terminal_number: { $in: ['1', '2'] },
        created_at: { $gt: 1704063600000, $lt: 1735686000000 },
        type: 0,
      },
    },
    {
      $unwind: '$order_lines',
    },
    {
      $group: {
        _id: null,
        quantity: {
          $sum: '$order_lines.quantity',
        },
      },
    },
  ];

  /**
   * Función de inicialización al cargar la pantalla
   */
  ngOnInit(): void {
    
    this.getKPIs();
    this.getTop3Chart();
    this.getPaymentMethodsChart();

    //Gráfico de ventas inicial al cargar la página
    this.printSalesEvoChart();
  }

  /**
   * Función que añade el caracter % en el value del chart Top más vendidos
   */
  formatPercentageLabel(value) {
    return value + '%';
  }

  /**
   * Función que solo muestra el value label en el gráfico de barras del mes que se ha seleccionado en el filtro
   */
  formatCurrencyLabel = (value) => {
    this.monthVarSearch = (<HTMLInputElement>(
      document.getElementById('monthDate')
    )).value;
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

  //Función que varía el color de las barras del gráfico dependiendo del mes seleccionado (realza el mes seleccionado y diluye el del resto)
  barCustomColors() {
    this.colorsKPI = [];
    this.monthVarSearch = (<HTMLInputElement>(
      document.getElementById('monthDate')
    )).value;
    if (this.monthVarSearch != 'Todos') {
      for (let i = 0; i < this.kpiDataset.length; i++) {
        this.colorsKPI.push({ name: this.kpiDataset[i].name, value: this.colors[0] });
      }
    }
    this.monthVarSearch = null;
    return this.colorsKPI;
  }

  //Método de filtro de búsqueda, modifica los datos mostrados en el apartado de KPIs en tiempo real conforme se cambian en el HTML

  searchTerminal() {
    //Obtención de variables de búsqueda de año y mes
    this.yearVarSearch = (<HTMLInputElement>(
      document.getElementById('yearDate')
    )).value;
    this.monthVarSearch = (<HTMLInputElement>(
      document.getElementById('monthDate')
    )).value;

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
      this.yearDate = new Date(
        parseInt(this.yearVarSearch),
        parseInt(this.monthVarSearch) - 1
      );
      this.dateMilli = this.yearDate.getTime();
      this.yearMaxDate = new Date(
        parseInt(this.yearVarSearch),
        parseInt(this.monthVarSearch)
      );
      this.dateMaxMilli = this.yearMaxDate.getTime();
      console.log(this.dateMilli);
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
    /*Variable de búsqueda "Terminal". En el if se establece el caso en el que se selecciona el valor "Todos" por lo que la variable
     de búsqueda se establece con todos los números de terminal*/
    if (this.terminalVarSearch == 'Todos') {
      //Se modifican las variables de consulta en el apartado de terminal con todas las terminales
      this.idOrders[1].$match.terminal_number = { $in: ['1', '2'] };
      this.idCM[0].$match.terminal_number = { $in: ['1', '2'] };
      this.idPM[1].$match.terminal_number = { $in: ['1', '2'] };
      this.idT3[0].$match.terminal_number = { $in: ['1', '2'] };
      this.idTP[0].$match.terminal_number = { $in: ['1', '2'] };
    } else {
      //En el else se establece el caso en el que se busca solo por una única terminal y se modifica las variables de consulta acorde
      this.idOrders[1].$match.terminal_number = this.terminalVarSearch;
      this.idCM[0].$match.terminal_number = this.terminalVarSearch;
      this.idPM[1].$match.terminal_number = this.terminalVarSearch;
      this.idT3[0].$match.terminal_number = this.terminalVarSearch;
      this.idTP[0].$match.terminal_number = this.terminalVarSearch;
    }

    this.getKPIs();
    this.getTop3Chart();
    this.getPaymentMethodsChart();
  }

  //Método de dibujado de gráfico de evolución de KPI

  fillCharKPIs(event) {
    
    this.loadedKPIChart = false;
    
    //Se captura el nombre del KPI en el que se clicka para mostrar el gráfico
    let target = event.target as HTMLElement;
    let idElement: string = target.id.slice(0, 5);

    //Reset del array del gráfico
    for (let i = 0; i < this.kpiDataset.length; i++) {
      this.kpiDataset[i].value = 0;
    }
    this.kpiDataset = [...this.kpiDataset];

    //Se atualiza la variable de búsqueda de terminal (en el if se establece el caso de todas las terminales y en el else el de terminal individual)
    if (this.terminalVarSearch == 'Todos') {
      this.IdEvo[1].$match.terminal_number = { $in: ['1', '2'] };
      this.idEvoCM[1].$match.terminal_number = { $in: ['1', '2'] };
      this.IdEvoResults[1].$match.terminal_number = { $in: ['1', '2'] };
    } else {
      this.IdEvo[1].$match.terminal_number = this.terminalVarSearch;
      this.idEvoCM[1].$match.terminal_number = this.terminalVarSearch;
      this.IdEvoResults[1].$match.terminal_number = this.terminalVarSearch;
    }

    //Se actualiza la variable de búsqueda de intervalo de tiempo, en este caso solo se usa la de año ya que no se permite filtrar por mes
    this.yearVarSearch = (<HTMLInputElement>(document.getElementById('yearDate'))).value;
    this.yearDate = new Date(parseInt(this.yearVarSearch), 0);
    this.yearMilli = this.yearDate.getTime();
    this.yearMaxMilli = this.yearMilli + 31536000000;
    if (this.yearMilli && this.yearMaxMilli != 0) {
      this.IdEvo[1].$match.created_at = {
        $gt: this.yearMilli,
        $lt: this.yearMaxMilli,
      };
      this.idEvoCM[1].$match.created_at = {
        $gt: this.yearMilli,
        $lt: this.yearMaxMilli,
      };
      this.IdEvoResults[1].$match.created_at = {
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

  printSalesEvoChart() {
    //Se establece el filtro de búsqueda de type en la variable a 0 para filtrar por operaciones de venta
    this.IdEvo[1].$match.type = 0;
    //Se realiza la llamada a la API con la variable de búsqueda actualizada (terminal, intervalo de tiempo y tipo)
    this.OrdersAggregateService.GetAggregationOrder(this.IdEvo).subscribe(
      (aggregation) => {
        this.aggregationsEvo = aggregation;

        //Actualzamos los colores de las barras
        for (let i = 0; i < this.colorsKPI.length; i++) {
          this.colorsKPI[i].value = this.colors[0];
        }

        //Se rellena el array de datos del gráfico en el apartado value de cada elemento con el dato obtenido de la consulta
        for (let i = 0; i < this.aggregationsEvo.length; i++) {
          this.kpiDataset[this.aggregationsEvo[i]._id - 1].value =
            this.aggregationsEvo[i].total / 100;
        }
        //Se rellenan aquellos campos sin datos en el array de valores del gráfico con 0
        for (let i = 0; i < this.kpiDataset.length; i++) {
          if (this.kpiDataset[i].value == null) {
            this.kpiDataset[i].value = 0;
          }
        }
        //Se actualiza el array de datos del gráfico para que se dibujen los nuevos datos introducidos
        this.kpiDataset = [...this.kpiDataset];

        //Variables de carga de gráficos se ponen en true
        this.loadedKPIChart = true;
      }
    );
  }

  printAverageEvoChart() {
    //Se establece el filtro de búsqueda de type en la variable a 0 para filtrar por operaciones de venta
    this.IdEvo[1].$match.type = 0;
    //Se realiza la llamada a la API con la variable de búsqueda actualizada (terminal, intervalo de tiempo y tipo)
    this.OrdersAggregateService.GetAggregationOrder(this.IdEvo).subscribe(
      (aggregation) => {
        this.aggregationsEvo = aggregation;

        //Actualzamos los colores de las barras
        for (let i = 0; i < this.colorsKPI.length; i++) {
          this.colorsKPI[i].value = this.colors[1];
        }

        //Se rellena el array de datos del gráfico en el apartado value de cada elemento con el dato obtenido de la consulta
        for (let i = 0; i < this.aggregationsEvo.length; i++) {
          this.kpiDataset[this.aggregationsEvo[i]._id - 1].value =
            this.aggregationsEvo[i].avg / 100;
        }
        //Se rellenan aquellos campos sin datos en el array de valores del gráfico con 0
        for (let i = 0; i < this.kpiDataset.length; i++) {
          if (this.kpiDataset[i].value == null) {
            this.kpiDataset[i].value = 0;
          }
        }
        //Se actualiza el array de datos del gráfico para que se dibujen los nuevos datos introducidos
        this.kpiDataset = [...this.kpiDataset];
        //Variables de carga de gráficos se ponen en true
        this.loadedKPIChart = true;
      }
    );
  }

  printRefundEvoChart() {
    //Se establece el filtro de búsqueda de type en la variable a 2 para filtrar por operaciones de devolución
    this.IdEvo[1].$match.type = 2;
    //Se realiza la llamada a la API con la variable de búsqueda actualizada (terminal, intervalo de tiempo y tipo)
    this.OrdersAggregateService.GetAggregationOrder(this.IdEvo).subscribe(
      (aggregation) => {
        this.aggregationsEvo = aggregation;

        //Actualzamos los colores de las barras
        for (let i = 0; i < this.colorsKPI.length; i++) {
          this.colorsKPI[i].value = this.colors[2];
        }

        //Se rellena el array de datos del gráfico en el apartado value de cada elemento con el dato obtenido de la consulta
        for (let i = 0; i < this.aggregationsEvo.length; i++) {
          this.kpiDataset[this.aggregationsEvo[i]._id - 1].value =
            this.aggregationsEvo[i].total / 100;
        }
        //Se rellenan aquellos campos sin datos en el array de valores del gráfico con 0
        for (let i = 0; i < this.kpiDataset.length; i++) {
          if (this.kpiDataset[i].value == null) {
            this.kpiDataset[i].value = 0;
          }
        }
        //Se actualiza el array de datos del gráfico para que se dibujen los nuevos datos introducidos
        this.kpiDataset = [...this.kpiDataset];
        //Variables de carga de gráficos se ponen en true
        this.loadedKPIChart = true;
      }
    );
  }

  printCMEvoChart() {
    //Se inicializan los array de in y out donde se van a poner los datos de los movimientos de caja positivos y negativos
    this.valueGraphArrayIn = new Array(12);
    this.valueGraphArrayOut = new Array(12);
    //Se realiza la llamada a la API con la variable de búsqueda actualizada (terminal y intervalo de tiempo)
    this.CashmovementsAggregateService.GetAggregationCashMovementsEvo(
      this.idEvoCM
    ).subscribe((aggregation) => {
      this.aggregationsEvoIn = aggregation;

      //Actualzamos los colores de las barras
      for (let i = 0; i < this.colorsKPI.length; i++) {
        this.colorsKPI[i].value = this.colors[3];
      }

      //Se rellena el array de datos del gráfico en el apartado value de cada elemento con el dato obtenido de la consulta
      for (let i = 0; i < this.aggregationsEvoIn.length; i++) {
        //Se separan los datos dependiendo de su id (0 movimiento in en el if y 1 movimiento out en el else)
        if (this.aggregationsEvoIn[i]._id.type == 0) {
          this.valueGraphArrayIn[this.aggregationsEvoIn[i]._id.month - 1] =
            this.aggregationsEvoIn[i].total / 100;
        } else {
          this.valueGraphArrayOut[this.aggregationsEvoIn[i]._id.month - 1] =
            this.aggregationsEvoIn[i].total / 100;
        }
      }
      //Se rellenan aquellos campos sin datos en el array de valores in y out con 0
      for (let i = 0; i < this.kpiDataset.length; i++) {
        if (this.valueGraphArrayIn[i] == null) {
          this.valueGraphArrayIn[i] = 0;
        }
        if (this.valueGraphArrayOut[i] == null) {
          this.valueGraphArrayOut[i] = 0;
        }
      }
      //Se rellena el array de datos del gráfico en el apartado value de cada elemento con la diferencia entre movimientos in y out
      for (let i = 0; i < this.kpiDataset.length; i++) {
        this.kpiDataset[i].value =
          this.valueGraphArrayIn[i] - this.valueGraphArrayOut[i];
      }
      //Se actualiza el array de datos del gráfico para que se dibujen los nuevos datos introducidos
      this.kpiDataset = [...this.kpiDataset];
      //Variables de carga de gráficos se ponen en true
      this.loadedKPIChart = true;
    });
  }

  printBalancesEvoChart() {
    //Se realiza la llamada a la API con la variable de búsqueda actualizada (terminal, intervalo de tiempo y tipo)
    this.OrdersAggregateService.GetAggregationOrderEvo(
      this.IdEvoResults
    ).subscribe((aggregation) => {
      this.aggregationsEvoOrder = aggregation;

      //Actualzamos los colores de las barras
      for (let i = 0; i < this.colorsKPI.length; i++) {
        this.colorsKPI[i].value = this.colors[4];
      }

      //Se clasifican los datos obtenidos según el tipo ( 0 ventas, 2 devoluciones y 5 rectificaciones) en el array de resultados
      for (let i = 0; i < this.aggregationsEvoOrder.length; i++) {
        switch (this.aggregationsEvoOrder[i]._id.type) {
          case 0:
            this.valueGraphArraySales[
              this.aggregationsEvoOrder[i]._id.month - 1
            ] = this.aggregationsEvoOrder[i].total / 100;
            break;
          case 2:
            this.valueGraphArrayRefunds[
              this.aggregationsEvoOrder[i]._id.month - 1
            ] = this.aggregationsEvoOrder[i].total / 100;
            break;
          case 5:
            this.valueGraphArrayRect[
              this.aggregationsEvoOrder[i]._id.month - 1
            ] = this.aggregationsEvoOrder[i].total / 100;
            break;
        }
      }
      //Se cambian los datos vacios del array de resultado por 0
      for (let i = 0; i < this.valueGraphArraySales.length; i++) {
        if (this.valueGraphArraySales[i] == null) {
          this.valueGraphArraySales[i] = 0;
        }
        if (this.valueGraphArrayRefunds[i] == null) {
          this.valueGraphArrayRefunds[i] = 0;
        }
        if (this.valueGraphArrayRect[i] == null) {
          this.valueGraphArrayRect[i] = 0;
        }
      }
      //Se actualizan los datos del array de resultados en el array de datos del gráfico para que se muestren los resultados (ventas - (devoluciones+rectificaciones))
      for (let i = 0; i < this.valueGraphArraySales.length; i++) {
        this.kpiDataset[i].value =
          this.valueGraphArraySales[i] -
          (this.valueGraphArrayRefunds[i] + this.valueGraphArrayRect[i]);
      }
      //Se rellenan con 0 los datos vacios del array del gráfico
      for (let i = 0; i < this.kpiDataset.length; i++) {
        if (this.kpiDataset[i].value == null) {
          this.kpiDataset[i].value = 0;
        }
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
   getKPIs() {

    //Llamada a la API para obtener los datos agregados de que se muestran en la sección KPIs de movimientos de caja
    this.CashmovementsAggregateService.GetAggregationCashMovements(this.idCM).subscribe(
      (aggregation) => {
        this.aggregationsCM = aggregation;
      }
    );

    //Comunicación con API para obtener los datos agregados que se muestran como base al iniciar la página en la sección de KPIs
    this.OrdersAggregateService.GetAggregationOrder(this.idOrders).subscribe(
      (aggregation) => {
        this.aggregations = aggregation;
        this.ordersResult = {total: 0, count: 0};
        this.refundsResult = {total: 0, count: 0};
        this.rectificationsResult = {total: 0, count: 0};

        //Bucle para recorrer el objeto respuesta
        for (let i = 0; i < this.aggregations.length; i++) {
          //If para comprobar si existen datos y el objeto no está vacio
          if (this.aggregations[i].total != null) {
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
      }
    );
  }

  /**
   * Función para mostrar los datos del gráfico de Top más vendidos
   */
  getTop3Chart() {
    //Llamada a la API para obtener el total de productos vendidos
    this.OrdersAggregateService.GetAggregationOrderTop3(this.idTP).subscribe(
      (aggregation) => {
        let aggregationsTP = aggregation;
        //Llamada a la API para obtener los datos del gráfico de top 3 más vendidos
        this.OrdersAggregateService.GetAggregationOrderTop3(this.idT3).subscribe(
          (aggregation) => {
            this.aggregationsTop3 = aggregation;
            //Se asocian los datos del objeto respuesta con los campos correspondientes del array de valores del gráfico
            let sumaTP = 0;
            this.colorsTop3 = [];
            for (let i = 0; i < this.aggregationsTop3.length; i++) {
              sumaTP = sumaTP + this.aggregationsTop3[i].quantity;
              this.datasetTop3[i].name = this.aggregationsTop3[i].product + ' (' + this.aggregationsTop3[i].quantity + ' uds)';
              this.datasetTop3[i].value = Math.round((this.aggregationsTop3[i].quantity / aggregationsTP[0].quantity) * 100);
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
  getPaymentMethodsChart() {
    //Llamada a la API para obtener los métodos de pago
    this.OrdersAggregateService.GetAggregationOrder(this.idPM).subscribe(
      (aggregation) => {
        this.aggregationsPM = aggregation;
        this.loadedPMChart = false;
        //Se reinicia el array de datos del gráfico
        for (let i = 0; i < this.datasetPM.length; i++) {
          this.datasetPM[i].value = 0;
        }
        //Se realiza la suma del número total de operaciones para, posteriormente, hacer el % de cada método de pago sobre el total
        let totalPM: number = 0;
        for (let i = 0; i < this.aggregationsPM.length; i++) {
          totalPM = totalPM + this.aggregationsPM[i].count;
        }
        //Se recorre el objeto respuesta
        for (let i = 0; i < this.aggregationsPM.length; i++) {
          //Se rellena el array que alimenta al gráfico con cada tipo de método de pago
          switch (this.aggregationsPM[i]._id) {
            case 'Tarjeta':
              this.datasetPM[1].value = Math.round((this.aggregationsPM[i].count / totalPM) * 100);
              this.datasetPM[1].name = 'Tarjeta';
              break;
            case 'Efectivo':
              this.datasetPM[0].value = Math.round((this.aggregationsPM[i].count / totalPM) * 100);
              this.datasetPM[0].name ='Efectivo';
              break;
            case 'Vales':
              this.datasetPM[2].value = Math.round((this.aggregationsPM[i].count / totalPM) * 100);
              this.datasetPM[2].name = 'Vales';
              break;
            case 'Virtual':
              this.datasetPM[3].value = Math.round((this.aggregationsPM[i].count / totalPM) * 100);
              this.datasetPM[3].name = 'Virtual';
              break;
            case 'Otros':
              this.datasetPM[4].value = Math.round((this.aggregationsPM[i].count / totalPM) * 100);
              this.datasetPM[4].name = 'Otros';
              break;
            case 'Bono Denda':
              this.datasetPM[5].value = Math.round((this.aggregationsPM[i].count / totalPM) * 100);
              this.datasetPM[5].name = 'Bono Denda';
              break;
            case 'Rectificación':
              this.datasetPM[6].value = Math.round((this.aggregationsPM[i].count / totalPM) * 100);
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