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
  
    lines.push('═══════════════════════════════════════════════');
    lines.push('        CAHIER DES CHARGES — PROJET WEB');
    lines.push('═══════════════════════════════════════════════');
    lines.push('');
  
    /* =======================
       1. QUALIFICATION DU PROSPECT
    ======================= */
    lines.push('1. QUALIFICATION DU PROSPECT');
    lines.push('─────────────────────────────────────────────');
    lines.push(
      `Client : ${d.client.firstName} ${d.client.lastName}` +
      (d.client.company ? ` — ${d.client.company}` : '')
    );
    
    if (d.client.sector) {
      lines.push(`Secteur : ${d.client.sector}`);
    }
    
    lines.push(`Contact : ${d.client.email}${d.client.phone ? ` — ${d.client.phone}` : ''}`);
    
    if (d.client.hasWebsite) {
      lines.push(
        'Dispose déjà d\'un site web' +
        (d.client.websiteUrl ? ` : ${d.client.websiteUrl}` : '')
      );
    } else {
      lines.push('Aucun site web existant');
    }
  
    lines.push('');

    // OBJECTIF PRINCIPAL
    lines.push('OBJECTIF PRINCIPAL :');
    const goalLabels: Record<string, string> = {
      leads: 'Générer des leads / prises de rendez-vous',
      vente: 'Vendre en ligne',
      image: 'Renforcer l\'image de marque',
      portfolio: 'Présenter un portfolio / activité'
    };
    if (d.project && d.project.goal) {
      lines.push(`→ ${goalLabels[d.project.goal] || d.project.goal}`);
    }
    lines.push('');

    // VISION DE SUCCÈS
    lines.push('VISION DE SUCCÈS (critère de réussite) :');
    if (d.project && d.project.successVision) {
      lines.push(`"${d.project.successVision}"`);
    } else {
      lines.push('Non renseignée');
    }
    lines.push('');

    // Budget (fourchettes plus serrées)
    lines.push('BUDGET & PLANNING :');
    const budgetLabels: Record<string, string> = {
      '600-1000': '600 – 1 000 € (vitrine simple)',
      '1000-1500': '1 000 – 1 500 € (vitrine personnalisée)',
      '1500-2500': '1 500 – 2 500 € (fonctionnalités avancées)',
      'gt2500': 'Plus de 2 500 € (e-commerce / sur-mesure)'
    };
    if (d.budget && d.budget.range) {
      lines.push(`Budget : ${budgetLabels[d.budget.range] || d.budget.range}`);
    }
    
    const timelineLabels: Record<string, string> = {
      'asap': 'ASAP (urgent)',
      '1-2m': '1-2 mois',
      '3-4m': '3-4 mois',
      'no-deadline': 'Pas de délai précis'
    };
    if (d.budget && d.budget.timeline) {
      lines.push(`Délai : ${timelineLabels[d.budget.timeline] || d.budget.timeline}`);
    }
    lines.push('');
  
    /* =======================
       2. TYPE DE PROJET
    ======================= */
    lines.push('2. TYPE DE PROJET');
    lines.push('─────────────────────────────────────────────');
  
    if (d.project.type === 'autre' && d.project.otherTypeLabel) {
      lines.push(`Type spécifique : ${d.project.otherTypeLabel}`);
    } else {
      const typeLabels: Record<string, string> = {
        vitrine: 'Site vitrine',
        ecommerce: 'E-commerce',
        blog: 'Blog / Média'
      };
      lines.push(`Type : ${typeLabels[d.project.type] || d.project.type}`);
    }
  
    lines.push('');

    // FONCTIONNALITÉS CLÉS
    lines.push('FONCTIONNALITÉS CLÉS SOUHAITÉES :');
    const features = d.features || {};
    const activeFeatures: string[] = [];
    if (features.booking) activeFeatures.push('- Prise de rendez-vous');
    if (features.payment) activeFeatures.push('- Paiement en ligne');
    if (features.blog) activeFeatures.push('- Blog / actualités');
    if (features.memberArea) activeFeatures.push('- Espace membre');
    if (features.multilingual) activeFeatures.push('- Multilingue');

    if (activeFeatures.length > 0) {
      activeFeatures.forEach(f => lines.push(f));
    } else {
      lines.push('Aucune fonctionnalité spécifique demandée');
    }
    lines.push('');
  
    /* =======================
       3. PÉRIMÈTRE FONCTIONNEL
    ======================= */
    lines.push('3. PÉRIMÈTRE FONCTIONNEL');
    lines.push('─────────────────────────────────────────────');
  
    if (d.project.type === 'ecommerce') {
      lines.push(`Catalogue : ${d.ecommerce.productCount} produits`);
      lines.push(
        `Gestion du stock : ${d.ecommerce.manageStock ? 'Oui (par le client)' : 'Non / externalisée'}`
      );
  
      const payments: string[] = [];
      const p = d.ecommerce.payments || {};
      if (p.cb) payments.push('CB');
      if (p.paypal) payments.push('PayPal');
      if (p.stripe) payments.push('Stripe');
      if (p.other && p.otherLabel) payments.push(p.otherLabel);
  
      if (payments.length) {
        lines.push(`Paiements : ${payments.join(', ')}`);
      }
  
      if (d.ecommerce.shipsFranceOnly) {
        lines.push('Livraison : France uniquement');
      } else {
        lines.push('Livraison : International');
        if (d.ecommerce.countries) {
          lines.push(`Pays : ${d.ecommerce.countries}`);
        }
      }
    } else {
      lines.push('Site vitrine / blog');
  
      if (d.vitrineBlog.needsBlog) {
        lines.push(
          `Blog intégré — Fréquence : ${d.vitrineBlog.blogFrequency}`
        );
        lines.push(`Catégories : ${d.vitrineBlog.blogCategories}`);
      } else {
        lines.push('Pas de blog prévu');
      }
  
      if (d.vitrineBlog.needsBooking) {
        lines.push(
          `Prise de RDV — Outil : ${d.vitrineBlog.bookingTool}`
        );
  
        if (d.vitrineBlog.connectAgenda) {
          lines.push(`Sync agenda : ${d.vitrineBlog.agendaType}`);
        }
      } else {
        lines.push('Pas de système de RDV');
      }
    }
  
    lines.push('');
  
    /* =======================
       4. CONTENUS
    ======================= */
    lines.push('4. CONTENUS');
    lines.push('─────────────────────────────────────────────');
  
    if (d.content.hasContent === 'oui') {
      lines.push('✓ Contenus disponibles (textes, images, logo)');
      lines.push(`Envoi via : ${d.content.sendMethod}`);
    } else {
      lines.push('✗ Contenus non disponibles');
      lines.push(
        `Rédaction : ${d.content.needsCopywriting ? 'Aide souhaitée' : 'Non nécessaire'}`
      );
      lines.push(
        `Visuels : ${d.content.needsVisualHelp ? 'Aide souhaitée' : 'Non nécessaire'}`
      );
    }
  
    lines.push('');
  
    /* =======================
       5. DESIGN & RÉFÉRENCES
    ======================= */
    lines.push('5. DESIGN & RÉFÉRENCES');
    lines.push('─────────────────────────────────────────────');
  
    if (d.design.hasBranding) {
      lines.push(`✓ Charte graphique disponible : ${d.design.brandingLink}`);
    } else {
      lines.push('✗ Pas de charte graphique');
    }
  
    if (d.design.hasReferences) {
      lines.push('');
      lines.push('RÉFÉRENCES VISUELLES :');
  
      const refs = d.design.references || {};
      if (refs.ref1Url) {
        lines.push(`1. ${refs.ref1Url}`);
        if (refs.ref1Notes) lines.push(`   → ${refs.ref1Notes}`);
      }
      if (refs.ref2Url) {
        lines.push(`2. ${refs.ref2Url}`);
        if (refs.ref2Notes) lines.push(`   → ${refs.ref2Notes}`);
      }
      if (refs.ref3Url) {
        lines.push(`3. ${refs.ref3Url}`);
        if (refs.ref3Notes) lines.push(`   → ${refs.ref3Notes}`);
      }
    } else {
      lines.push('Aucune référence communiquée');
    }
  
    lines.push('');
  
    /* =======================
       6. OBSERVATIONS
    ======================= */
    lines.push('6. OBSERVATIONS COMPLÉMENTAIRES');
    lines.push('─────────────────────────────────────────────');
  
    if (d.recap.additionalNotes) {
      lines.push(d.recap.additionalNotes);
    } else {
      lines.push('Aucune observation');
    }
  
    lines.push('');
    lines.push(
      `Demande de rappel : ${d.recap.wantsCallback ? 'OUI' : 'NON'}`
    );

    lines.push('');
    lines.push('═══════════════════════════════════════════════');
    lines.push('          FIN DU CAHIER DES CHARGES');
    lines.push('═══════════════════════════════════════════════');
  
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
        this.errorMsg = "Impossible d'envoyer pour le moment. Vérifie que le backend /api/brief/submit est disponible.";
      },
    });
  }

  copyToClipboard() {
    navigator.clipboard.writeText(this.structuredText);
  }
}