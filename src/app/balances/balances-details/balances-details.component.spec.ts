import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BalancesDetailsComponent } from './balances-details.component';

describe('BalancesDetailsComponent', () => {
  let component: BalancesDetailsComponent;
  let fixture: ComponentFixture<BalancesDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BalancesDetailsComponent ]
    }).compileComponents();

    fixture = TestBed.createComponent(BalancesDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
