import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { FormService } from '../../form.service';

@Component({
  selector: 'app-step-design',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './step-design.html',
})
export class StepDesign {
  @Output() back = new EventEmitter<void>();
  @Output() next = new EventEmitter<void>();

  constructor(public formSvc: FormService) {}

  get group(): FormGroup {
    return this.formSvc.form.get('design') as FormGroup;
  }

  get refs(): FormGroup {
    return this.group.get('references') as FormGroup;
  }

  submit() {
    this.group.markAllAsTouched();
    this.refs.markAllAsTouched();
    if (this.group.valid) this.next.emit();
  }
}