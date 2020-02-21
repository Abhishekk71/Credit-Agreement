import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RepaymentDashboardComponent } from './repayment-dashboard.component';

describe('RepaymentDashboardComponent', () => {
  let component: RepaymentDashboardComponent;
  let fixture: ComponentFixture<RepaymentDashboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RepaymentDashboardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RepaymentDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
