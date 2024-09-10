import { CashmovementsAggregateService } from './../_services/cashmovements-aggregate.service';
import { OrdersAggregateService } from './../_services/orders-aggregate.service';
import { Component, OnInit } from '@angular/core';
import { OrderAggregation } from '../_models/Orderaggregation.model';
import { OrderAggregationCash } from '../_models/OrderAggregationCash.model';
import { OrderAggregationTop3 } from '../_models/top3sales.model';

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
    this.boundFormatDataLabel1 = this.formatDataLabel1.bind(this);
    this.boundBarCustomColors = this.barCustomColors.bind(this);
  }

  boundFormatDataLabel1: any;
  boundBarCustomColors: any;
  target;
  formatLabelCounter: number = 0;
  formatLabelCounter1: number = 0;
  idElement;
  loadedGraphics = true;
  loaded = false;
  loadedPM = false;
  loadedTP = false;
  loadedOninit = false;
  terminalVarSearch: any = 'Todos';
  yearVarSearch = '';
  monthVarSearch = '';
  yearDate;
  monthDate;
  today: Date = new Date();
  year = this.today.getFullYear();
  yearMilli = 0;
  yearMaxDate;
  yearMaxMilli = 0;
  monthMaxMilli = 0;
  dateMilli = 0;
  dateMaxMilli = 0;
  resultsVarArray = new Array(3);
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
  dataset = [
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

  datasetPM = [
    { name: 'Efectivo', value: 0 },
    { name: 'Tarjeta', value: 0 },
    { name: 'Vales', value: 0 },
    { name: 'Virtual', value: 0 },
    { name: 'Otros', value: 0 },
    { name: 'Bono Denda', value: 0 },
    { name: 'Rectificación', value: 0 },
  ];

  datasetTop3 = [
    { name: '', value: 0 },
    { name: '', value: 0 },
    { name: '', value: 0 },
    { name: '', value: 0 },
  ];

  //Función que añade % al final del value label de los gráficos

  formatDataLabel(value) {
    return value + '%';
  }

  //Función que solo muestra el value label en el gráfico de barras del mes que se ha seleccionado en el filtro

  formatDataLabel1 = (value) => {
    this.monthVarSearch = (<HTMLInputElement>(
      document.getElementById('monthDate')
    )).value;
    if (this.monthVarSearch != 'Todos') {
      if (this.dataset[+this.monthVarSearch - 1].value == value && value !=0) {
        value = value.toFixed(2) + '€';
      } else {
        value = null;
      }
    } else {
      if (value == 0) {
        value = null;
      } else {
        value = value + '€';
      }
    }
    this.monthVarSearch = null;
    return value;
  };

  //Función que varía el color de las barras del gráfico dependiendo del mes seleccionado (realza el mes seleccionado y diluye el del resto)

  result: any[] = [];

  barCustomColors() {
    this.result = [];
    this.monthVarSearch = (<HTMLInputElement>(
      document.getElementById('monthDate')
    )).value;
    if (this.monthVarSearch != 'Todos') {
      for (let i = 0; i < this.dataset.length; i++) {
        if (i == +this.monthVarSearch - 1) {
          this.result.push({ name: this.dataset[i].name, value: '#0080ff' });
        } else
          this.result.push({ name: this.dataset[i].name, value: '#e5f2fe' });
      }
    }
    this.monthVarSearch = null;
    return this.result;
  }
  //Variables de búsqueda de aggregation
  //Variable aggregation orders
  id = [
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
  idEvoCash = [
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

  //Variables consulta API

  isLoggedIn: boolean = true;
  aggregations: OrderAggregation[];
  aggregationsPM: OrderAggregation[];
  aggregationsCM: OrderAggregation[];
  aggregationsEvo: OrderAggregation[];
  aggregationsEvoOrder: OrderAggregationCash[];
  aggregationsEvoIn: OrderAggregationCash[];
  aggregationsTop3: OrderAggregationTop3[];
  aggregationsTP: OrderAggregationTop3[];
  Math = Math;

  ngOnInit(): void {
    //Comunicación con API para obtener los datos agregados que se muestran como base al iniciar la página en la sección de KPIs
    this.OrdersAggregateService.GetAggregationOrder(this.id).subscribe(
      (aggregation) => {
        this.aggregations = aggregation;
        //Bucle para recorrer el objeto respuesta
        for (let i = 0; i < this.aggregations.length; i++) {
          //If para comprobar si existen datos y el objeto no está vacio
          if (this.aggregations[i].total != null) {
            //Switch para comprobar si existen datos de ventas (id 0), de devoluciones (id 2) o rectificaciones (id 5)
            switch (this.aggregations[i]._id) {
              case 0:
                //Para cada caso se rellena el array de resultados tanto del total con los decimales ya aplicados como del conteo de nº de operaciones
                this.resultsVarArray[0] =
                  this.aggregations[i].total /
                  this.Math.pow(10, this.aggregations[i].decimals);
                this.resultsVarArray[3] = this.aggregations[i].count;
                break;
              case 2:
                this.resultsVarArray[1] =
                  this.aggregations[i].total /
                  this.Math.pow(10, this.aggregations[i].decimals);
                this.resultsVarArray[4] = this.aggregations[i].count;
                break;
              case 5:
                this.resultsVarArray[2] =
                  this.aggregations[i].total /
                  this.Math.pow(10, this.aggregations[i].decimals);
                this.resultsVarArray[5] = this.aggregations[i].count;
                break;
            }
          } else {
            //Si el objeto está vacio el array de resultados se rellena con un 0
            this.resultsVarArray[i] = 0;
          }
        }
        //Se recorre el array de resultados para sustituir elementos nulos o vacios por 0
        for (let i = 0; i < this.resultsVarArray.length; i++) {
          if (this.resultsVarArray[i] == null) {
            this.resultsVarArray[i] = 0;
          }
        }
      } /* ,
  (error) => {
    if (error.status == 401) {
      this.isLoggedIn = false;
    };
  } */
    );
    //Comunicación con API para obtener los datos agregados que se muestran como base al iniciar la página en el gráfico de métodos de pago
    this.OrdersAggregateService.GetAggregationOrder(this.idPM).subscribe(
      (aggregation) => {
        this.loadedPM = false;
        this.aggregationsPM = aggregation;
        let addPM: number = 0;
        //Se realiza la suma del número de operaciones para, posteriormente, hacer el % de cada método de pago sobre el total
        for (let i = 0; i < this.aggregationsPM.length; i++) {
          addPM = addPM + this.aggregationsPM[i].count;
        }
        //Se recorre el objeto respuesta
        for (let i = 0; i < this.aggregationsPM.length; i++) {
          //Se rellena el array que alimenta al gráfico con cada tipo de método de pago según el campo _id del objeto y se transforma el dato en % sobre el total
          switch (this.aggregationsPM[i]._id) {
            case 'Tarjeta':
              this.datasetPM[1].value = Math.round(
                (this.aggregationsPM[i].count / addPM) * 100
              );
              this.datasetPM[1].name =
                this.datasetPM[1].name + ' ' + this.datasetPM[1].value + ' %';
              break;
            case 'Efectivo':
              this.datasetPM[0].value = Math.round(
                (this.aggregationsPM[i].count / addPM) * 100
              );
              this.datasetPM[0].name =
                this.datasetPM[0].name + ' ' + this.datasetPM[0].value + ' %';
              break;
            case 'Vales':
              this.datasetPM[2].value = Math.round(
                (this.aggregationsPM[i].count / addPM) * 100
              );
              this.datasetPM[2].name =
                this.datasetPM[2].name + ' ' + this.datasetPM[2].value + ' %';
              break;
            case 'Virtual':
              this.datasetPM[3].value = Math.round(
                (this.aggregationsPM[i].count / addPM) * 100
              );
              this.datasetPM[3].name =
                this.datasetPM[3].name + ' ' + this.datasetPM[3].value + ' %';
              break;
            case 'Otros':
              this.datasetPM[4].value = Math.round(
                (this.aggregationsPM[i].count / addPM) * 100
              );
              this.datasetPM[4].name =
                this.datasetPM[4].name + ' ' + this.datasetPM[4].value + ' %';
              break;
            case 'Bono Denda':
              this.datasetPM[5].value = Math.round(
                (this.aggregationsPM[i].count / addPM) * 100
              );
              this.datasetPM[5].name =
                this.datasetPM[5].name + ' ' + this.datasetPM[5].value + ' %';
              break;
            case 'Rectificación':
              this.datasetPM[6].value = Math.round(
                (this.aggregationsPM[i].count / addPM) * 100
              );
              this.datasetPM[6].name =
                this.datasetPM[6].name + ' ' + this.datasetPM[6].value + ' %';
              break;
          }
        }
        //Variable de carga de gráfico marcada como true
        this.loadedPM = true;
      } /* ,
  (error) => {
    if (error.status == 401) {
      this.isLoggedIn = false;
    };
  } */
    );
    //Comunicación con API para obtener los datos agregados que se muestran como base al iniciar la página en la sección de KPIs, apartado de movimientos de caja
    this.CashmovementsAggregateService.GetAggregationCashMovements(
      this.idCM
    ).subscribe(
      (aggregation) => {
        this.aggregationsCM = aggregation;
      } /* ,
  (error) => {
    if (error.status == 401) {
      this.isLoggedIn = false;
    };
  } */
    );
    //Comunicación con API para obtener el total de productos vendidos
    this.OrdersAggregateService.GetAggregationOrderTop3(this.idTP).subscribe(
      (aggregation) => {
        this.aggregationsTP = aggregation;
        console.log(this.aggregationsTP);
        //Comunicación con API para obtener los datos del gráfico de top 3 productos vendidos al cargar la página
        this.OrdersAggregateService.GetAggregationOrderTop3(
          this.idT3
        ).subscribe(
          (aggregation) => {
            this.aggregationsTop3 = aggregation;
            console.log(this.aggregationsTop3);
            //Se asocian los datos del objeto respuesta con los campos correspondientes del array de valores del gráfico
            let sumaTP = 0;
            for (let i = 0; i < this.aggregationsTop3.length; i++) {
              sumaTP = sumaTP + this.aggregationsTop3[i].quantity;
              this.datasetTop3[i].name =
                this.aggregationsTop3[i].product +
                ' (' +
                this.aggregationsTop3[i].quantity +
                ' uds)';
              this.datasetTop3[i].value = Math.round(
                (this.aggregationsTop3[i].quantity /
                  this.aggregationsTP[0].quantity) *
                  100
              );
            }
            //Se asocia el 4º puesto del array del gráfico correspondiente al apartado "resto de productos"
            //El dato se obtiene restando el valor total de la consulta de aggregationsTP a la sumaTP
            this.datasetTop3[3].name =
              'Resto' +
              ' (' +
              (this.aggregationsTP[0].quantity - sumaTP) +
              ' uds)';
            this.datasetTop3[3].value = Math.round(
              ((this.aggregationsTP[0].quantity - sumaTP) /
                this.aggregationsTP[0].quantity) *
                100
            );
            this.loadedTP = true;
          } /* ,
  (error) => {
    if (error.status == 401) {
      this.isLoggedIn = false;
    };
  } */
        );
      } /* ,
    (error) => {
      if (error.status == 401) {
        this.isLoggedIn = false;
      };
    } */
    );
    //Gráfico de ventas base al cargar la página
    //Se establece el filtro de búsqueda de type en la variable a 0 para filtrar por operaciones de venta
    this.IdEvo[1].$match.type = 0;
    //Se realiza la llamada a la API con la variable de búsqueda actualizada (terminal, intervalo de tiempo y tipo)
    this.OrdersAggregateService.GetAggregationOrder(this.IdEvo).subscribe(
      (aggregation) => {
        this.aggregationsEvo = aggregation;
        //Se rellena el array de datos del gráfico en el apartado value de cada elemento con el dato obtenido de la consulta
        for (let i = 0; i < this.aggregationsEvo.length; i++) {
          this.dataset[this.aggregationsEvo[i]._id - 1].value =
            this.aggregationsEvo[i].total / 100;
        }
        //Se rellenan aquellos campos sin datos en el array de valores del gráfico con 0
        for (let i = 0; i < this.dataset.length; i++) {
          if (this.dataset[i].value == null) {
            this.dataset[i].value = 0;
          }
        }
        //Se actualiza el array de datos del gráfico para que se dibujen los nuevos datos introducidos
        this.dataset = [...this.dataset];
        //Variables de carga de gráficos se ponen en true
        this.loaded = true;
        this.loadedGraphics = true;
      }
    );
    //Variable de carga de datos base marcada como true
    this.loadedOninit = true;
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
    console.log(this.monthVarSearch);
    //Se comprueba si es necesario filtrar por solo año o por año+mes, el if es el caso de solo año
    if (this.monthVarSearch.length == 0 || this.monthVarSearch == 'Todos') {
      //Se obtiene el año inicial (yearMilli) y el año máximo (yearMaxMilli) y se transforma a unicode
      console.log('entra');
      this.yearDate = new Date(parseInt(this.yearVarSearch), 0);
      this.yearMilli = this.yearDate.getTime();
      this.yearMaxMilli = this.yearMilli + 31536000000;
      //Se actualizan las variables de búsqueda en el apartado de intervalo de fecha para enviar la consulta a la API
      this.id[1].$match.created_at = {
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
      console.log('entra');
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
      this.id[1].$match.created_at = {
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
      this.id[1].$match.terminal_number = { $in: ['1', '2'] };
      this.idCM[0].$match.terminal_number = { $in: ['1', '2'] };
      this.idPM[1].$match.terminal_number = { $in: ['1', '2'] };
      this.idT3[0].$match.terminal_number = { $in: ['1', '2'] };
      this.idTP[0].$match.terminal_number = { $in: ['1', '2'] };
    } else {
      //En el else se establece el caso en el que se busca solo por una única terminal y se modifica las variables de consulta acorde
      this.id[1].$match.terminal_number = this.terminalVarSearch;
      this.idCM[0].$match.terminal_number = this.terminalVarSearch;
      this.idPM[1].$match.terminal_number = this.terminalVarSearch;
      this.idT3[0].$match.terminal_number = this.terminalVarSearch;
      this.idTP[0].$match.terminal_number = this.terminalVarSearch;
    }

    //Llamada al método de comunicación con la API para obtener el objeto correspondiente a los campos de ventas, ticket medio, devoluciones y resultado

    this.OrdersAggregateService.GetAggregationOrder(this.id).subscribe(
      (aggregation) => {
        this.aggregations = aggregation;
        //Se resetea el array de resultados
        this.resultsVarArray = new Array(3);
        for (let i = 0; i < this.aggregations.length; i++) {
          if (this.aggregations[i].total != null) {
            //Switch para comprobar si existen datos de ventas (id 0), de devoluciones (id 2) o rectificaciones (id 5)
            switch (this.aggregations[i]._id) {
              //Para cada caso se rellena el array de resultados tanto del total con los decimales ya aplicados como del conteo de nº de operaciones
              case 0:
                this.resultsVarArray[0] =
                  this.aggregations[i].total /
                  this.Math.pow(10, this.aggregations[i].decimals);
                this.resultsVarArray[3] = this.aggregations[i].count;
                break;
              case 2:
                this.resultsVarArray[1] =
                  this.aggregations[i].total /
                  this.Math.pow(10, this.aggregations[i].decimals);
                this.resultsVarArray[4] = this.aggregations[i].count;
                break;
              case 5:
                this.resultsVarArray[2] =
                  this.aggregations[i].total /
                  this.Math.pow(10, this.aggregations[i].decimals);
                this.resultsVarArray[5] = this.aggregations[i].count;
                break;
            }
          } else {
            //Si el objeto está vacio el array de resultados se rellena con un 0
            this.resultsVarArray[i] = 0;
          }
        }
        //Se recorre el array de resultados para sustituir elementos nulos o vacios por 0
        for (let i = 0; i < this.resultsVarArray.length; i++) {
          if (this.resultsVarArray[i] == null) {
            this.resultsVarArray[i] = 0;
          }
        }
      }
    );

    //Se llama al método de comunicación de API para el campo de mov. caja

    this.CashmovementsAggregateService.GetAggregationCashMovements(
      this.idCM
    ).subscribe((aggregation) => {
      this.aggregationsCM = aggregation;
    });

    //Se llama al método de comunicación de API para el gráfico métodos de pago

    this.OrdersAggregateService.GetAggregationOrder(this.idPM).subscribe(
      (aggregation) => {
        this.aggregationsPM = aggregation;
        this.loadedPM = false;
        //Se reinicia el array de datos del gráfico
        for (let i = 0; i < this.datasetPM.length; i++) {
          this.datasetPM[i].value = 0;
        }
        //Se realiza la suma del número de operaciones para, posteriormente, hacer el % de cada método de pago sobre el total
        let addPM: number = 0;
        for (let i = 0; i < this.aggregationsPM.length; i++) {
          addPM = addPM + this.aggregationsPM[i].count;
        }
        //Se recorre el objeto respuesta
        for (let i = 0; i < this.aggregationsPM.length; i++) {
          //Se rellena el array que alimenta al gráfico con cada tipo de método de pago según el campo _id del objeto y se transforma el dato en % sobre el total
          switch (this.aggregationsPM[i]._id) {
            case 'Tarjeta':
              this.datasetPM[1].value = Math.round(
                (this.aggregationsPM[i].count / addPM) * 100
              );
              this.datasetPM[1].name =
                'Tarjeta' + ' ' + this.datasetPM[1].value + ' %';
              break;
            case 'Efectivo':
              this.datasetPM[0].value = Math.round(
                (this.aggregationsPM[i].count / addPM) * 100
              );
              this.datasetPM[0].name =
                'Efectivo' + ' ' + this.datasetPM[0].value + ' %';
              break;
            case 'Vales':
              this.datasetPM[2].value = Math.round(
                (this.aggregationsPM[i].count / addPM) * 100
              );
              this.datasetPM[2].name =
                'Vales' + ' ' + this.datasetPM[2].value + ' %';
              break;
            case 'Virtual':
              this.datasetPM[3].value = Math.round(
                (this.aggregationsPM[i].count / addPM) * 100
              );
              this.datasetPM[3].name =
                'Virtual' + ' ' + this.datasetPM[3].value + ' %';
              break;
            case 'Otros':
              this.datasetPM[4].value = Math.round(
                (this.aggregationsPM[i].count / addPM) * 100
              );
              this.datasetPM[4].name =
                'Otros' + ' ' + this.datasetPM[4].value + ' %';
              break;
            case 'Bono Denda':
              this.datasetPM[5].value = Math.round(
                (this.aggregationsPM[i].count / addPM) * 100
              );
              this.datasetPM[5].name =
                'Bono Denda' + ' ' + this.datasetPM[5].value + ' %';
              break;
            case 'Rectificación':
              this.datasetPM[6].value = Math.round(
                (this.aggregationsPM[i].count / addPM) * 100
              );
              this.datasetPM[6].name =
                'Rectificación' + ' ' + this.datasetPM[6].value + ' %';
              break;
          }
        }
        //Para que se actualice el gráfico con los datos nuevos hay que reiniciar el array de datos
        this.datasetPM = [...this.datasetPM];

        //Variable de carga del gráfico se cambia a true
        this.loadedPM = true;
      }
    );
    //Comunicación con API para obtener el total de productos vendidos
    this.OrdersAggregateService.GetAggregationOrderTop3(this.idTP).subscribe(
      (aggregation) => {
        this.aggregationsTP = aggregation;
        //Comunicación con API para obtener los datos del gráfico de top 3 productos vendidos al cargar la página
        this.OrdersAggregateService.GetAggregationOrderTop3(
          this.idT3
        ).subscribe(
          (aggregation) => {
            this.aggregationsTop3 = aggregation;
            console.log(this.aggregationsTop3);
            //Se reinicia el array de datos del gráfico
            for (let i = 0; i < this.datasetTop3.length; i++) {
              this.datasetTop3[i].name = '';
              this.datasetTop3[i].value = 0;
            }
            //Se asocian los datos del objeto respuesta con los campos correspondientes del array de valores del gráfico
            let sumaTP = 0;
            for (let i = 0; i < this.aggregationsTop3.length; i++) {
              sumaTP = sumaTP + this.aggregationsTop3[i].quantity;
              this.datasetTop3[i].name =
                this.aggregationsTop3[i].product +
                ' (' +
                this.aggregationsTop3[i].quantity +
                ' uds)';
              this.datasetTop3[i].value = Math.round(
                (this.aggregationsTop3[i].quantity /
                  this.aggregationsTP[0].quantity) *
                  100
              );
            }
            //Se recorre el array de resultados para sustituir elementos nulos o vacios por 0
            for (let i = 0; i < this.datasetTop3.length; i++) {
              if (this.datasetTop3[i].value == 0) {
                this.datasetTop3[i].name = 'No hay producto';
              }
            }
            //Se asocia el 4º puesto del array del gráfico correspondiente al apartado "resto de productos"
            //El dato se obtiene restando el valor total de la consulta de aggregationsTP a la sumaTP
            if (
              this.aggregationsTP !== undefined &&
              this.aggregationsTP.length
            ) {
              this.datasetTop3[3].name =
                'Resto' +
                ' (' +
                (this.aggregationsTP[0].quantity - sumaTP) +
                ' uds)';
              this.datasetTop3[3].value = Math.round(
                ((this.aggregationsTP[0].quantity - sumaTP) /
                  this.aggregationsTP[0].quantity) *
                  100
              );
            }
            //Para que se actualice el gráfico con los datos nuevos hay que reiniciar el array de datos
            this.datasetTop3 = [...this.datasetTop3];
            this.loadedTP = true;
          } /* ,
      (error) => {
        if (error.status == 401) {
        this.isLoggedIn = false;
          };
      } */
        );
      } /* ,
      (error) => {
    if (error.status == 401) {
      this.isLoggedIn = false;
    };
    } */
    );
  }

  //Método de cambio de título en sección de "Evolución de KPI"

  showSales(event) {
    //Se captura el nombre del KPI en el que se clicka para mostrar el gráfico
    let target = event.target as HTMLElement;
    let idElement: string = target.id.slice(0, 5);
    //Segun el string capturado se activa la variable de nombre escogida y se desactiva el resto
    switch (idElement) {
      case 'sales':
        this.showSalesVar = false;
        this.showRefundsVar = false;
        this.showAverageTicketVar = false;
        this.showCashMovVar = false;
        this.showResultsVar = false;
        this.showSalesVar = true;
        break;
      case 'avera':
        this.showSalesVar = false;
        this.showRefundsVar = false;
        this.showAverageTicketVar = false;
        this.showCashMovVar = false;
        this.showResultsVar = false;
        this.showAverageTicketVar = true;
        break;
      case 'refun':
        this.showSalesVar = false;
        this.showRefundsVar = false;
        this.showAverageTicketVar = false;
        this.showCashMovVar = false;
        this.showResultsVar = false;
        this.showRefundsVar = true;
        break;
      case 'casmo':
        this.showSalesVar = false;
        this.showRefundsVar = false;
        this.showAverageTicketVar = false;
        this.showCashMovVar = false;
        this.showResultsVar = false;
        this.showCashMovVar = true;
        break;
      case 'balan':
        this.showSalesVar = false;
        this.showRefundsVar = false;
        this.showAverageTicketVar = false;
        this.showCashMovVar = false;
        this.showResultsVar = false;
        this.showResultsVar = true;
        break;
    }
  }

  //Método de dibujado de gráfico de evolución de KPI

  createSalesGraphic(event) {
    this.loadedGraphics = false;
    this.loaded = false;
    //Reset del array del gráfico
    for (let i = 0; i < this.dataset.length; i++) {
      this.dataset[i].value = 0;
    }
    this.dataset = [...this.dataset];
    //Si existen parámetros de búsqueda diferentes a los base se actualizan
    //Se atualiza la variable de búsqueda de terminal (en el if se establece el caso de todas las terminales y en el else el de terminal individual)
    if (this.terminalVarSearch == 'Todos') {
      this.IdEvo[1].$match.terminal_number = { $in: ['1', '2'] };
      this.idEvoCash[1].$match.terminal_number = { $in: ['1', '2'] };
      this.IdEvoResults[1].$match.terminal_number = { $in: ['1', '2'] };
    } else {
      this.IdEvo[1].$match.terminal_number = this.terminalVarSearch;
      this.idEvoCash[1].$match.terminal_number = this.terminalVarSearch;
      this.IdEvoResults[1].$match.terminal_number = this.terminalVarSearch;
    }
    //Se actualiza la variable de búsqueda de intervalo de tiempo, en este caso solo se usa la de año ya que no se permite filtrar por mes
    console.log(this.yearMilli);
    this.yearVarSearch = (<HTMLInputElement>(
      document.getElementById('yearDate')
    )).value;
    this.yearDate = new Date(parseInt(this.yearVarSearch), 0);
    this.yearMilli = this.yearDate.getTime();
    this.yearMaxMilli = this.yearMilli + 31536000000;

    if (this.yearMilli && this.yearMaxMilli != 0) {
      this.IdEvo[1].$match.created_at = {
        $gt: this.yearMilli,
        $lt: this.yearMaxMilli,
      };
      this.idEvoCash[1].$match.created_at = {
        $gt: this.yearMilli,
        $lt: this.yearMaxMilli,
      };
      this.IdEvoResults[1].$match.created_at = {
        $gt: this.yearMilli,
        $lt: this.yearMaxMilli,
      };
    }

    //Llamada a la API para obtener la agregación
    //Se captura el nombre del KPI en el que se clicka para mostrar el gráfico
    this.target = event.target as HTMLElement;
    /*Se hace distinción si el click viene del apartado de KPIs (se actualiza el id para el switch) o si viene del filtro de búsqueda
    (se reutiliza el id anterior para actualizar los datos del gráfico en tiempo real)*/
    if (
      (this.target.id == 'searchTer' || this.target.id == 'yearDate') &&
      this.idElement != null
    ) {
      this.idElement = this.idElement;
    } else {
      if (
        this.target.id.slice(0, 5) == 'sales' ||
        this.target.id.slice(0, 5) == 'avera' ||
        this.target.id.slice(0, 5) == 'refun' ||
        this.target.id.slice(0, 5) == 'casmo' ||
        this.target.id.slice(0, 5) == 'balan'
      ) {
        this.idElement = this.target.id.slice(0, 5);
      } else {
        this.loadedGraphics = true;
      }
    }
    //Según el KPI seleccionado se dibuja el gráfico con los datos correspondientes
    console.log(this.idElement);
    switch (this.idElement) {
      case undefined:
      case 'sales':
        //Se establece el filtro de búsqueda de type en la variable a 0 para filtrar por operaciones de venta
        this.IdEvo[1].$match.type = 0;
        //Se realiza la llamada a la API con la variable de búsqueda actualizada (terminal, intervalo de tiempo y tipo)
        this.OrdersAggregateService.GetAggregationOrder(this.IdEvo).subscribe(
          (aggregation) => {
            this.aggregationsEvo = aggregation;
            //Se rellena el array de datos del gráfico en el apartado value de cada elemento con el dato obtenido de la consulta
            for (let i = 0; i < this.aggregationsEvo.length; i++) {
              this.dataset[this.aggregationsEvo[i]._id - 1].value =
                this.aggregationsEvo[i].total / 100;
            }
            //Se rellenan aquellos campos sin datos en el array de valores del gráfico con 0
            for (let i = 0; i < this.dataset.length; i++) {
              if (this.dataset[i].value == null) {
                this.dataset[i].value = 0;
              }
            }
            //Se actualiza el array de datos del gráfico para que se dibujen los nuevos datos introducidos
            this.dataset = [...this.dataset];
            //Variables de carga de gráficos se ponen en true
            this.loaded = true;
            this.loadedGraphics = true;
          }
        );
        break;
      case 'avera':
        //Se establece el filtro de búsqueda de type en la variable a 0 para filtrar por operaciones de venta
        this.IdEvo[1].$match.type = 0;
        //Se realiza la llamada a la API con la variable de búsqueda actualizada (terminal, intervalo de tiempo y tipo)
        this.OrdersAggregateService.GetAggregationOrder(this.IdEvo).subscribe(
          (aggregation) => {
            this.aggregationsEvo = aggregation;
            //Se rellena el array de datos del gráfico en el apartado value de cada elemento con el dato obtenido de la consulta
            for (let i = 0; i < this.aggregationsEvo.length; i++) {
              this.dataset[this.aggregationsEvo[i]._id - 1].value =
                this.aggregationsEvo[i].avg / 100;
            }
            //Se rellenan aquellos campos sin datos en el array de valores del gráfico con 0
            for (let i = 0; i < this.dataset.length; i++) {
              if (this.dataset[i].value == null) {
                this.dataset[i].value = 0;
              }
            }
            //Se actualiza el array de datos del gráfico para que se dibujen los nuevos datos introducidos
            this.dataset = [...this.dataset];
            //Variables de carga de gráficos se ponen en true
            this.loaded = true;
            this.loadedGraphics = true;
          }
        );
        break;
      case 'refun':
        //Se establece el filtro de búsqueda de type en la variable a 2 para filtrar por operaciones de devolución
        this.IdEvo[1].$match.type = 2;
        //Se realiza la llamada a la API con la variable de búsqueda actualizada (terminal, intervalo de tiempo y tipo)
        this.OrdersAggregateService.GetAggregationOrder(this.IdEvo).subscribe(
          (aggregation) => {
            this.aggregationsEvo = aggregation;
            //Se rellena el array de datos del gráfico en el apartado value de cada elemento con el dato obtenido de la consulta
            for (let i = 0; i < this.aggregationsEvo.length; i++) {
              this.dataset[this.aggregationsEvo[i]._id - 1].value =
                this.aggregationsEvo[i].total / 100;
            }
            //Se rellenan aquellos campos sin datos en el array de valores del gráfico con 0
            for (let i = 0; i < this.dataset.length; i++) {
              if (this.dataset[i].value == null) {
                this.dataset[i].value = 0;
              }
            }
            //Se actualiza el array de datos del gráfico para que se dibujen los nuevos datos introducidos
            this.dataset = [...this.dataset];
            //Variables de carga de gráficos se ponen en true
            this.loaded = true;
            this.loadedGraphics = true;
          }
        );
        break;
      case 'casmo':
        //Se inicializan los array de in y out donde se van a poner los datos de los movimientos de caja positivos y negativos
        this.valueGraphArrayIn = new Array(12);
        this.valueGraphArrayOut = new Array(12);
        //Se realiza la llamada a la API con la variable de búsqueda actualizada (terminal y intervalo de tiempo)
        this.CashmovementsAggregateService.GetAggregationCashMovementsEvo(
          this.idEvoCash
        ).subscribe((aggregation) => {
          this.aggregationsEvoIn = aggregation;
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
          for (let i = 0; i < this.dataset.length; i++) {
            if (this.valueGraphArrayIn[i] == null) {
              this.valueGraphArrayIn[i] = 0;
            }
            if (this.valueGraphArrayOut[i] == null) {
              this.valueGraphArrayOut[i] = 0;
            }
          }
          //Se rellena el array de datos del gráfico en el apartado value de cada elemento con la diferencia entre movimientos in y out
          for (let i = 0; i < this.dataset.length; i++) {
            this.dataset[i].value =
              this.valueGraphArrayIn[i] - this.valueGraphArrayOut[i];
          }
          //Se actualiza el array de datos del gráfico para que se dibujen los nuevos datos introducidos
          this.dataset = [...this.dataset];
          //Variables de carga de gráficos se ponen en true
          this.loaded = true;
          this.loadedGraphics = true;
        });
        break;
      case 'balan':
        //Se realiza la llamada a la API con la variable de búsqueda actualizada (terminal, intervalo de tiempo y tipo)
        this.OrdersAggregateService.GetAggregationOrderEvo(
          this.IdEvoResults
        ).subscribe((aggregation) => {
          this.aggregationsEvoOrder = aggregation;
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
            this.dataset[i].value =
              this.valueGraphArraySales[i] -
              (this.valueGraphArrayRefunds[i] + this.valueGraphArrayRect[i]);
          }
          //Se rellenan con 0 los datos vacios del array del gráfico
          for (let i = 0; i < this.dataset.length; i++) {
            if (this.dataset[i].value == null) {
              this.dataset[i].value = 0;
            }
          }
          //Se actualiza el array del gráfico para que se dibujen los datos nuevos en el gráfico
          this.dataset = [...this.dataset];
          //Las variables de carga de gráfico se ponen en true
          this.loaded = true;
          this.loadedGraphics = true;
        });
    }
    console.log(this.IdEvo);
    console.log(this.dataset);
  }
}
