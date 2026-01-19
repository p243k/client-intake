import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { FormService } from '../../form.service';

@Component({
  selector: 'app-step-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './step-profile.html',
})
export class StepProfile {
  @Output() next = new EventEmitter<void>();

  constructor(public formSvc: FormService) {}

  get group(): FormGroup {
    return this.formSvc.form.get('client') as FormGroup;
  }

  submit() {
    this.group.markAllAsTouched();
    if (this.group.valid) this.next.emit();
  }
}