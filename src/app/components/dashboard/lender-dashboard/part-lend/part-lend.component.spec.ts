import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PartLendComponent } from './part-lend.component';

describe('PartLendComponent', () => {
  let component: PartLendComponent;
  let fixture: ComponentFixture<PartLendComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PartLendComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PartLendComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
