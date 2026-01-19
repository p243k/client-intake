import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StepContent } from './step-content';

describe('StepContent', () => {
  let component: StepContent;
  let fixture: ComponentFixture<StepContent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StepContent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StepContent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
