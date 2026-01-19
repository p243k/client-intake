import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StepEcommerce } from './step-ecommerce';

describe('StepEcommerce', () => {
  let component: StepEcommerce;
  let fixture: ComponentFixture<StepEcommerce>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StepEcommerce]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StepEcommerce);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
