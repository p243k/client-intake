import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StepDesign } from './step-design';

describe('StepDesign', () => {
  let component: StepDesign;
  let fixture: ComponentFixture<StepDesign>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StepDesign]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StepDesign);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
