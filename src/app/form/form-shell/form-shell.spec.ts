import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormShell } from './form-shell';

describe('FormShell', () => {
  let component: FormShell;
  let fixture: ComponentFixture<FormShell>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormShell]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormShell);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
