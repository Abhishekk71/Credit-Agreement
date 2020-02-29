import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewLendDetailsComponent } from './view-lend-details.component';

describe('ViewLendDetailsComponent', () => {
  let component: ViewLendDetailsComponent;
  let fixture: ComponentFixture<ViewLendDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewLendDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewLendDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
