import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StepBudget } from './step-budget';

describe('StepBudget', () => {
  let component: StepBudget;
  let fixture: ComponentFixture<StepBudget>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StepBudget]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StepBudget);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
