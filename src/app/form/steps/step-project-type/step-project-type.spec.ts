import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StepProjectType } from './step-project-type';

describe('StepProjectType', () => {
  let component: StepProjectType;
  let fixture: ComponentFixture<StepProjectType>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StepProjectType]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StepProjectType);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
