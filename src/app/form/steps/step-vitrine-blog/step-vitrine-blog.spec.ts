import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StepVitrineBlog } from './step-vitrine-blog';

describe('StepVitrineBlog', () => {
  let component: StepVitrineBlog;
  let fixture: ComponentFixture<StepVitrineBlog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StepVitrineBlog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StepVitrineBlog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
