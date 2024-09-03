import { CashmovementsAggregateService } from './../_services/cashmovements-aggregate.service';
import { OrdersAggregateService } from './../_services/orders-aggregate.service';
import { Component, OnInit } from '@angular/core';
import { OrderAggregation } from '../_models/Orderaggregation.model';
import { OrderAggregationCash } from '../_models/OrderAggregationCash.model';

@Component({
  selector: 'DPOSW-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: [],
})
export class DashboardComponent implements OnInit {
  constructor(
    private OrdersAggregateService: OrdersAggregateService,
    private CashmovementsAggregateService: CashmovementsAggregateService
  ) {}

  loaded = false;
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

  isLoggedIn: boolean = true;
  aggregations: OrderAggregation[];
  aggregationsCM: OrderAggregation[];
  aggregationsEvo: OrderAggregation[];
  aggregationsEvoOrder: OrderAggregationCash[];
  aggregationsEvoIn: OrderAggregationCash[];
  Math = Math;

  ngOnInit(): void {
    this.OrdersAggregateService.GetAggregationOrder(this.id).subscribe(
      (aggregation) => {
        this.aggregations = aggregation;
        for(let i = 0; i<this.aggregations.length; i++){
          if(this.aggregations[i].total != null){
          this.resultsVarArray[i] = this.aggregations[i].total/this.Math.pow(10, this.aggregations[i].decimals)
          } else {
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
    this.loadedOninit = true;
  }

  searchTerminal() {
    this.yearVarSearch = (<HTMLInputElement>(
      document.getElementById('yearDate')
    )).value;
    this.monthVarSearch = (<HTMLInputElement>(
      document.getElementById('monthDate')
    )).value;
    if (
      (this.monthVarSearch.length == 0 || this, this.monthVarSearch == 'Todos')
    ) {
      this.yearDate = new Date(parseInt(this.yearVarSearch), 0);
      this.yearMilli = this.yearDate.getTime();
      this.yearMaxMilli = this.yearMilli + 31536000000;
    } else {
      this.yearDate = new Date(
        parseInt(this.yearVarSearch),
        parseInt(this.monthVarSearch) - 1
      );
      this.yearMilli = this.yearDate.getTime();
      this.yearMaxDate = new Date(
        parseInt(this.yearVarSearch),
        parseInt(this.monthVarSearch)
      );
      this.yearMaxMilli = this.yearMaxDate.getTime();
    }
    if (this.terminalVarSearch == 'Todos') {
      this.id[1].$match.terminal_number = { $in: ['1', '2'] };
      this.idCM[0].$match.terminal_number = { $in: ['1', '2'] };
    } else {
      this.id[1].$match.terminal_number = this.terminalVarSearch;
      this.idCM[0].$match.terminal_number = this.terminalVarSearch;
    }
    this.id[1].$match.created_at = {
      $gt: this.yearMilli,
      $lt: this.yearMaxMilli,
    };
    this.idCM[0].$match.created_at = {
      $gt: this.yearMilli,
      $lt: this.yearMaxMilli,
    };
    this.OrdersAggregateService.GetAggregationOrder(this.id).subscribe(
      (aggregation) => {
        this.aggregations = aggregation;
        for(let i = 0; i<this.aggregations.length; i++){
          if(this.aggregations[i].total != null){
          this.resultsVarArray[i] = this.aggregations[i].total/this.Math.pow(10, this.aggregations[i].decimals)
          } else {
            this.resultsVarArray[i] = 0;
          }
        }
      }
    );
    this.CashmovementsAggregateService.GetAggregationCashMovements(
      this.idCM
    ).subscribe((aggregation) => {
      this.aggregationsCM = aggregation;
    });


    console.log(this.resultsVarArray)

  }

  showSales(event: MouseEvent) {
    let target = event.target as HTMLElement;
    let idElement: string = target.id.slice(0, 5);
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

  createSalesGraphic(event: MouseEvent) {
    this.loaded = false;
    //Reset del array del gráfico
    for (let i = 0; i < this.dataset.length; i++) {
      this.dataset[i].value = 0;
    }
    this.dataset = [...this.dataset];
    //Si existen parámetros de búsqueda diferentes a los base se actualizan
    if (this.terminalVarSearch == 'Todos') {
      this.IdEvo[1].$match.terminal_number = { $in: ['1', '2'] };
      this.idEvoCash[1].$match.terminal_number = { $in: ['1', '2'] };
    } else {
      this.IdEvo[1].$match.terminal_number = this.terminalVarSearch;
      this.idEvoCash[1].$match.terminal_number = this.terminalVarSearch;
    }
    if (this.yearMilli && this.yearMaxMilli != 0) {
      this.IdEvo[1].$match.created_at = {
        $gt: this.yearMilli,
        $lt: this.yearMaxMilli,
      };
      this.idEvoCash[1].$match.created_at = {
        $gt: this.yearMilli,
        $lt: this.yearMaxMilli,
      };
    }
    //Llamada a la API para obtener la agregación
    let target = event.target as HTMLElement;
    let idElement: string = target.id.slice(0, 5);
    switch (idElement) {
      case 'sales':
        this.IdEvo[1].$match.type = 0;
        this.OrdersAggregateService.GetAggregationOrder(this.IdEvo).subscribe(
          (aggregation) => {
            this.aggregationsEvo = aggregation;

            for (let i = 0; i < this.aggregationsEvo.length; i++) {
              this.dataset[this.aggregationsEvo[i]._id - 1].value =
                this.aggregationsEvo[i].total / 100;
            }
            for (let i = 0; i < this.dataset.length; i++) {
              if (this.dataset[i].value == null) {
                this.dataset[i].value = 0;
              }
            }
            this.dataset = [...this.dataset];
            this.loaded = true;
          }
        );
        break;
      case 'refun':
        this.IdEvo[1].$match.type = 2;
        this.OrdersAggregateService.GetAggregationOrder(this.IdEvo).subscribe(
          (aggregation) => {
            this.aggregationsEvo = aggregation;

            for (let i = 0; i < this.aggregationsEvo.length; i++) {
              this.dataset[this.aggregationsEvo[i]._id - 1].value =
                this.aggregationsEvo[i].total / 100;
            }
            for (let i = 0; i < this.dataset.length; i++) {
              if (this.dataset[i].value == null) {
                this.dataset[i].value = 0;
              }
            }
            this.dataset = [...this.dataset];
            this.loaded = true;
          }
        );
        break;
      case 'casmo':
        this.valueGraphArrayIn = new Array(12);
        this.valueGraphArrayOut = new Array(12);
        this.CashmovementsAggregateService.GetAggregationCashMovementsEvo(
          this.idEvoCash
        ).subscribe((aggregation) => {
          this.aggregationsEvoIn = aggregation;
          for (let i = 0; i < this.aggregationsEvoIn.length; i++) {
            if (this.aggregationsEvoIn[i]._id.type == 0) {
              this.valueGraphArrayIn[this.aggregationsEvoIn[i]._id.month - 1] =
                this.aggregationsEvoIn[i].total / 100;
            } else {
              this.valueGraphArrayOut[this.aggregationsEvoIn[i]._id.month - 1] =
                this.aggregationsEvoIn[i].total / 100;
            }
          }
          for (let i = 0; i < this.dataset.length; i++) {
            if (this.valueGraphArrayIn[i] == null) {
              this.valueGraphArrayIn[i] = 0;
            }
            if (this.valueGraphArrayOut[i] == null) {
              this.valueGraphArrayOut[i] = 0;
            }
          }
          for (let i = 0; i < this.dataset.length; i++) {
            this.dataset[i].value =
              this.valueGraphArrayIn[i] - this.valueGraphArrayOut[i];
          }
          this.dataset = [...this.dataset];
          this.loaded = true;
        });
        break;
      case 'balan':
        this.IdEvo[1].$match.type = 0;
        this.OrdersAggregateService.GetAggregationOrderEvo(
          this.IdEvoResults
        ).subscribe((aggregation) => {
          this.aggregationsEvoOrder = aggregation;

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

          for (let i = 0; i < this.valueGraphArraySales.length; i++) {
            this.dataset[i].value =
              this.valueGraphArraySales[i] -
              (this.valueGraphArrayRefunds[i] + this.valueGraphArrayRect[i]);
          }
          for (let i = 0; i < this.dataset.length; i++) {
            if (this.dataset[i].value == null) {
              this.dataset[i].value = 0;
            }
          }
          this.dataset = [...this.dataset];
          this.loaded = true;
        });
    }
  }
}
