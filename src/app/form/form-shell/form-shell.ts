import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormService } from '../form.service';
import { StepProfile } from '../steps/step-profile/step-profile';
import { StepProjectType } from '../steps/step-project-type/step-project-type';
import { StepContent } from '../steps/step-content/step-content';
import { StepDesign } from '../steps/step-design/step-design';
import { StepBudget } from '../steps/step-budget/step-budget';
import { StepRecap } from '../steps/step-recap/step-recap';
import { StepVitrineBlog } from '../steps/step-vitrine-blog/step-vitrine-blog';
import { StepEcommerce } from '../steps/step-ecommerce/step-ecommerce';
import { StepDone } from '../steps/step-done/step-done';

type StepId =
  | 'profile'
  | 'projectType'
  | 'vitrineBlog'
  | 'ecommerce'
  | 'content'
  | 'design'
  | 'budget'
  | 'recap'
  | 'done';

@Component({
  selector: 'app-form-shell',
  standalone: true,
  imports: [
    CommonModule,
    StepProfile,
    StepProjectType,
    StepVitrineBlog,
    StepEcommerce,
    StepContent,
    StepDesign,
    StepBudget,
    StepRecap,
    StepDone
  ],
  
  templateUrl: './form-shell.html',
})
export class FormShell {
  steps: { id: StepId; label: string }[] = [
  { id: 'profile', label: 'Profil client' },
  { id: 'projectType', label: 'Type de projet' },
  { id: 'vitrineBlog', label: 'Détails vitrine / blog' },
  { id: 'ecommerce', label: 'Détails e-commerce' },
  { id: 'content', label: 'Contenus' },
  { id: 'design', label: 'Design' },
  { id: 'budget', label: 'Budget & délais' },
  { id: 'recap', label: 'Récap' },
  { id: 'done', label: 'Done'}
];


  current: StepId = 'profile';
  private history: StepId[] = [];

  constructor(public formSvc: FormService) {}

  get currentIndex() {
    return this.steps.findIndex(s => s.id === this.current);
  }

  private getNextStepId(current: StepId): StepId | null {
    const projectType = this.formSvc.form.get('project.type')?.value as string | null;
  
    switch (current) {
      case 'profile':
        return 'projectType';
  
      case 'projectType':
        // Branche principale
        return projectType === 'ecommerce' ? 'ecommerce' : 'vitrineBlog';
  
      case 'ecommerce':
      case 'vitrineBlog':
        return 'content';
  
      case 'content':
        return 'design';
  
      case 'design':
        return 'budget';
  
      case 'budget':
        return 'recap';
  
      case 'recap':
        return null;
  
      default:
        return null;
    }
  }
  

  get progressPercent(): number {
    return Math.round(((this.currentIndex + 1) / this.steps.length) * 100);
  }

  goNext() {
    const next = this.getNextStepId(this.current);
    if (!next) return;
    this.history.push(this.current);
    this.current = next;
  }

  goBack() {
    const prev = this.history.pop();
    if (prev) this.current = prev;
  }
}