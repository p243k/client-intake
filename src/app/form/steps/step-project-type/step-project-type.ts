import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, Validators } from '@angular/forms';
import { FormService } from '../../form.service';

@Component({
  selector: 'app-step-project-type',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './step-project-type.html',
})
export class StepProjectType {
  @Output() back = new EventEmitter<void>();
  @Output() next = new EventEmitter<void>();

  constructor(public formSvc: FormService) {
    this.setupOtherTypeLogic();
  }

  get group(): FormGroup {
    return this.formSvc.form.get('project') as FormGroup;
  }

  private setupOtherTypeLogic() {
    const typeCtrl = this.group.get('type')!;
    const otherCtrl = this.group.get('otherTypeLabel')!;

    typeCtrl.valueChanges.subscribe((v: string | null) => {
      if (v === 'autre') {
        otherCtrl.setValidators([Validators.required]);
      } else {
        otherCtrl.clearValidators();
        otherCtrl.setValue('', { emitEvent: false });
      }
      otherCtrl.updateValueAndValidity({ emitEvent: false });
    });

    // appliquer au chargement draft
    const current = typeCtrl.value;
    if (current === 'autre') {
      otherCtrl.setValidators([Validators.required]);
      otherCtrl.updateValueAndValidity({ emitEvent: false });
    }
  }

  submit() {
    this.group.markAllAsTouched();
    if (this.group.valid) this.next.emit();
  }
}