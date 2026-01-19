import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { FormService } from '../../form.service';

@Component({
  selector: 'app-step-ecommerce',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './step-ecommerce.html',
})
export class StepEcommerce {
  @Output() back = new EventEmitter<void>();
  @Output() next = new EventEmitter<void>();

  constructor(public formSvc: FormService) {}

  get group(): FormGroup {
    return this.formSvc.form.get('ecommerce') as FormGroup;
  }

  get payments(): FormGroup {
    return this.group.get('payments') as FormGroup;
  }

  submit() {
    this.group.markAllAsTouched();
    this.payments.markAllAsTouched();
    if (this.group.valid) this.next.emit();
  }
}