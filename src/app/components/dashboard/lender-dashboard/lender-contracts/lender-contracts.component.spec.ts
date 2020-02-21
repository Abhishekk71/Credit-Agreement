import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LenderContractsComponent } from './lender-contracts.component';

describe('PartLendComponent', () => {
  let component: LenderContractsComponent;
  let fixture: ComponentFixture<LenderContractsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LenderContractsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LenderContractsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
