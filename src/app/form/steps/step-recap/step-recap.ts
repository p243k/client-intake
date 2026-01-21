import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { FormService } from '../../form.service';
import { BriefSubmitService } from '../../brief-submit.service';

@Component({
  selector: 'app-step-recap',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './step-recap.html',
})
export class StepRecap {
  @Output() back = new EventEmitter<void>();
  @Output() done = new EventEmitter<void>();

  sending = false;
  errorMsg = '';

  constructor(public formSvc: FormService, private submitSvc: BriefSubmitService) {}

  get recapGroup(): FormGroup {
    return this.formSvc.form.get('recap') as FormGroup;
  }

  get data() {
    // IMPORTANT : on utilise value (pas getRawValue)
    // → champs disabled exclus = cahier des charges propre
    return this.formSvc.form.value;
  }

  get structuredText(): string {
    const d = this.data;
    const lines: string[] = [];
  
    lines.push('CAHIER DES CHARGES');
    lines.push('Projet web — version préliminaire');
    lines.push('');
  
    /* =======================
       1. CONTEXTE DU PROJET
    ======================= */
    lines.push('1. Contexte du projet');
    lines.push(
      `Ce document synthétise les éléments communiqués par ${d.client.firstName} ${d.client.lastName}` +
      (d.client.company ? `, représentant de l’entreprise ${d.client.company}` : '') +
      ', dans le cadre de la définition de son projet web.'
    );
  
    if (d.client.sector) {
      lines.push(`Le projet s’inscrit dans le secteur d’activité suivant : ${d.client.sector}.`);
    }
  
    lines.push(`Contact principal : ${d.client.email}` + (d.client.phone ? ` — ${d.client.phone}` : '.'));
  
    if (d.client.hasWebsite) {
      lines.push(
        'Le client dispose déjà d’un site web existant.' +
        (d.client.websiteUrl ? ` Celui-ci est accessible à l’adresse suivante : ${d.client.websiteUrl}.` : '')
      );
    } else {
      lines.push('Le client ne dispose pas actuellement de site web.');
    }
  
    lines.push('');
  
    /* =======================
       2. NATURE DU PROJET
    ======================= */
    lines.push('2. Nature du projet');
  
    if (d.project.type === 'autre' && d.project.otherTypeLabel) {
      lines.push(
        `Le client a exprimé le souhait de réaliser un projet de type spécifique, décrit comme suit : ${d.project.otherTypeLabel}.`
      );
    } else {
      lines.push(`Le projet concerne la réalisation d’un ${d.project.type}.`);
    }
  
    lines.push('');
  
    /* =======================
       3. PÉRIMÈTRE FONCTIONNEL
    ======================= */
    lines.push('3. Périmètre fonctionnel');
  
    if (d.project.type === 'ecommerce') {
      lines.push(
        `Le projet comprend une dimension e-commerce, avec un catalogue estimé à ${d.ecommerce.productCount} produits.`
      );
  
      lines.push(
        `La gestion du stock sera ${d.ecommerce.manageStock ? 'assurée par le client.' : 'externalisée ou non gérée par le client.'}`
      );
  
      const payments: string[] = [];
      const p = d.ecommerce.payments || {};
      if (p.cb) payments.push('carte bancaire');
      if (p.paypal) payments.push('PayPal');
      if (p.stripe) payments.push('Stripe');
      if (p.other && p.otherLabel) payments.push(p.otherLabel);
  
      if (payments.length) {
        lines.push(`Les moyens de paiement envisagés sont les suivants : ${payments.join(', ')}.`);
      }
  
      if (d.ecommerce.shipsFranceOnly) {
        lines.push('La livraison est prévue uniquement sur le territoire français.');
      } else {
        lines.push('La livraison est prévue en dehors du territoire français.');
        if (d.ecommerce.countries) {
          lines.push(`Pays mentionnés : ${d.ecommerce.countries}.`);
        }
      }
    } else {
      lines.push('Le projet porte sur un site de type vitrine / blog.');
  
      if (d.vitrineBlog.needsBlog) {
        lines.push(
          `Le client souhaite intégrer un blog, avec une fréquence de publication estimée à ${d.vitrineBlog.blogFrequency}.`
        );
        lines.push(`Les catégories principales évoquées sont : ${d.vitrineBlog.blogCategories}.`);
      } else {
        lines.push('Aucun blog n’est prévu dans le périmètre initial.');
      }
  
      if (d.vitrineBlog.needsBooking) {
        lines.push(
          `Un système de prise de rendez-vous en ligne est souhaité, via l’outil suivant : ${d.vitrineBlog.bookingTool}.`
        );
  
        if (d.vitrineBlog.connectAgenda) {
          lines.push(`Une synchronisation avec un agenda (${d.vitrineBlog.agendaType}) est envisagée.`);
        }
      } else {
        lines.push('Aucun système de prise de rendez-vous n’est prévu.');
      }
    }
  
    lines.push('');
  
    /* =======================
       4. CONTENUS
    ======================= */
    lines.push('4. Contenus');
  
    if (d.content.hasContent === 'oui') {
      lines.push(
        `Le client indique disposer de l’ensemble des contenus nécessaires (textes, images, logo).`
      );
      lines.push(`Les contenus seront transmis via le canal suivant : ${d.content.sendMethod}.`);
    } else {
      lines.push(
        `Le client ne dispose pas de l’ensemble des contenus au moment de la rédaction de ce document.`
      );
      lines.push(
        `Un accompagnement pour la rédaction des textes est ${
          d.content.needsCopywriting ? 'souhaité.' : 'non souhaité.'
        }`
      );
      lines.push(
        `Un accompagnement pour les visuels est ${
          d.content.needsVisualHelp ? 'souhaité.' : 'non souhaité.'
        }`
      );
    }
  
    lines.push('');
  
    /* =======================
       5. DESIGN & RÉFÉRENCES
    ======================= */
    lines.push('5. Design et références');
  
    if (d.design.hasBranding) {
      lines.push(
        `Le client dispose déjà d’une charte graphique et/ou d’un logo. Un lien a été communiqué : ${d.design.brandingLink}.`
      );
    } else {
      lines.push('Le client ne dispose pas de charte graphique ou de logo à ce stade.');
    }
  
    if (d.design.hasReferences) {
      lines.push('Le client a communiqué les références suivantes :');
  
      const refs = d.design.references || {};
      if (refs.ref1Url) {
        lines.push(`- ${refs.ref1Url}${refs.ref1Notes ? ` — ${refs.ref1Notes}` : ''}`);
      }
      if (refs.ref2Url) {
        lines.push(`- ${refs.ref2Url}${refs.ref2Notes ? ` — ${refs.ref2Notes}` : ''}`);
      }
      if (refs.ref3Url) {
        lines.push(`- ${refs.ref3Url}${refs.ref3Notes ? ` — ${refs.ref3Notes}` : ''}`);
      }
    } else {
      lines.push('Aucune référence de site n’a été communiquée.');
    }
  
    lines.push('');
  
    /* =======================
       6. BUDGET & PLANNING
    ======================= */
    lines.push('6. Budget et planning');
  
    lines.push(`Le budget envisagé par le client se situe dans la tranche suivante : ${d.budget.range}.`);
    lines.push(`Le délai idéal évoqué pour la réalisation du projet est : ${d.budget.timeline}.`);
  
    lines.push('');
  
    /* =======================
       7. OBSERVATIONS COMPLÉMENTAIRES
    ======================= */
    lines.push('7. Observations complémentaires');
  
    if (d.recap.additionalNotes) {
      lines.push(d.recap.additionalNotes);
    } else {
      lines.push('Aucune observation complémentaire n’a été communiquée.');
    }
  
    lines.push('');
    lines.push(
      `Le client a indiqué ${
        d.recap.wantsCallback ? 'souhaiter être recontacté pour échanger oralement.' : 'ne pas souhaiter de rappel téléphonique.'
      }`
    );
  
    return lines.join('\n');
  }  
  

  validateAndSend() {
    this.sending = true;
    this.errorMsg = '';

    // We intentionally submit the "clean" values (disabled controls excluded)
    const payload = this.formSvc.form.value;

    this.submitSvc.submit(payload).subscribe({
      next: () => {
        this.sending = false;
        this.formSvc.resetAll();
        this.done.emit();
      },
      error: () => {
        this.sending = false;
        this.errorMsg = "Impossible d’envoyer pour le moment. Vérifie que le backend /api/brief/submit est disponible.";
      },
    });
  }

  copyToClipboard() {
    navigator.clipboard.writeText(this.structuredText);
  }
}