import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { FormService } from '../../form.service';

@Component({
  selector: 'app-step-content',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './step-content.html',
})
export class StepContent {
  @Output() back = new EventEmitter<void>();
  @Output() next = new EventEmitter<void>();

  constructor(public formSvc: FormService) {}

  get group(): FormGroup {
    return this.formSvc.form.get('content') as FormGroup;
  }

  get pages(): FormGroup {
    return this.group.get('pages') as FormGroup;
  }

  submit() {
    // Marquer tous les champs comme touchés pour afficher les erreurs
    this.group.markAllAsTouched();
    
    // Vérifier que textHelp et visualsHelp sont remplis
    const textHelp = this.group.get('textHelp')?.value;
    const visualsHelp = this.group.get('visualsHelp')?.value;
    
    if (!textHelp || !visualsHelp) {
      // Ne pas continuer si les champs obligatoires ne sont pas remplis
      return;
    }
    
    // Continuer si tout est valide
    this.next.emit();
  }
}