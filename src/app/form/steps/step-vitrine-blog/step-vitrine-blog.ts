import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { FormService } from '../../form.service';

@Component({
  selector: 'app-step-vitrine-blog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './step-vitrine-blog.html',
})
export class StepVitrineBlog {
  @Output() back = new EventEmitter<void>();
  @Output() next = new EventEmitter<void>();

  constructor(public formSvc: FormService) {}

  get group(): FormGroup {
    return this.formSvc.form.get('vitrineBlog') as FormGroup;
  }

  submit() {
    this.group.markAllAsTouched();
    // Ici, certains champs sont conditionnels et peuvent être disabled,
    // donc la validité reflète correctement ce qui est requis.
    if (this.group.valid) this.next.emit();
  }
}