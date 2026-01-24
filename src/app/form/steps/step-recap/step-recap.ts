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

  get internalGroup(): FormGroup {
    return this.formSvc.form.get('internalMeraki') as FormGroup;
  }

  get data() {
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
    if (d.project && d.project.goal) {
      lines.push('OBJECTIF PRINCIPAL :');
      const goalLabels: Record<string, string> = {
        'devis-rdv': 'Obtenir des demandes de devis/rendez-vous',
        'vente': 'Vendre en ligne',
        'presenter-rassurer': 'Présenter l\'activité et rassurer',
        'recruter': 'Recruter/attirer des partenaires',
        'autre': d.project.goalOther || 'Autre objectif'
      };
      lines.push(`→ ${goalLabels[d.project.goal] || d.project.goal}`);
      lines.push('');
    }

    // VISION DE SUCCÈS
    if (d.project && d.project.successVision) {
      lines.push('VISION DE SUCCÈS (critère de réussite) :');
      lines.push(`"${d.project.successVision}"`);
      lines.push('');
    }

    // Budget
    if (d.budget) {
      lines.push('BUDGET & PLANNING :');
      const budgetLabels: Record<string, string> = {
        '400-700': '400 – 700 € (vitrine simple)',
        '700-1000': '700 – 1 000 € (vitrine personnalisée)',
        '1000-1500': '1 000 – 1 500 € (site complet)',
        '1500-2500': '1 500 – 2 500 € (fonctionnalités avancées)',
        'gt2500': 'Plus de 2 500 € (projet complexe)',
        '1500': '1 500 € (e-commerce minimum)',
        '2500': '2 500 € (e-commerce moyen)',
        '3500-plus': '3 500 € et plus (gros projet e-commerce)'
      };
      if (d.budget.range) {
        lines.push(`Budget : ${budgetLabels[d.budget.range] || d.budget.range}`);
      }
      
      const timelineLabels: Record<string, string> = {
        'moins-1m': 'Moins d\'1 mois (urgent)',
        '1-2m': '1-2 mois',
        '3m-plus': '3 mois et +',
        'no-deadline': 'Pas de date précise'
      };
      if (d.budget.timeline) {
        lines.push(`Délai : ${timelineLabels[d.budget.timeline] || d.budget.timeline}`);
      }
      lines.push('');
    }
  
    /* =======================
       2. TYPE DE PROJET & FONCTIONNALITÉS
    ======================= */
    lines.push('2. TYPE DE PROJET & FONCTIONNALITÉS');
    lines.push('─────────────────────────────────────────────');
  
    if (d.project && d.project.type) {
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
    }

    // Style global
    if (d.project && d.project.stylePreference) {
      const styleLabels: Record<string, string> = {
        sobre: 'Sobre / Minimaliste',
        dynamique: 'Dynamique / Coloré',
        corporate: 'Corporate / Sérieux',
        creatif: 'Créatif / Original'
      };
      lines.push(`Style souhaité : ${styleLabels[d.project.stylePreference]}`);
    }
  
    lines.push('');

    // FONCTIONNALITÉS avec niveaux d'importance
    if (d.features) {
      lines.push('FONCTIONNALITÉS :');
      
      if (d.features.blogImportance) {
        const blogLabels: Record<string, string> = {
          'indispensable': '- Blog : INDISPENSABLE',
          'interessant': '- Blog : Intéressant',
          'pas-utile': '- Blog : Pas utile'
        };
        lines.push(blogLabels[d.features.blogImportance]);
      }

      if (d.features.bookingImportance) {
        const bookingLabels: Record<string, string> = {
          'indispensable': '- Prise de RDV : INDISPENSABLE',
          'plus-tard': '- Prise de RDV : Plus tard',
          'pas-utile': '- Prise de RDV : Pas utile'
        };
        lines.push(bookingLabels[d.features.bookingImportance]);
      }

      if (d.features.otherFeatures) {
        lines.push(`- Autres : ${d.features.otherFeatures}`);
      }

      lines.push('');
    }
  
    /* =======================
       3. PÉRIMÈTRE (E-COMMERCE ou VITRINE)
    ======================= */
    lines.push('3. PÉRIMÈTRE FONCTIONNEL');
    lines.push('─────────────────────────────────────────────');
  
    if (d.project && d.project.type === 'ecommerce' && d.ecommerce) {
      // Mode de gestion
      if (d.ecommerce.managementType) {
        const mgmtLabels: Record<string, string> = {
          'cle-en-main': 'Solution clé en main (Meraki gère stock & envois)',
          'autonome': 'Gestion autonome (client gère stock & envois)',
          'a-definir': 'Mode de gestion à définir ensemble'
        };
        lines.push(`Mode : ${mgmtLabels[d.ecommerce.managementType]}`);
      }

      if (d.ecommerce.productCount) {
        lines.push(`Catalogue : ${d.ecommerce.productCount} produits`);
      }
  
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
    } else if (d.vitrineBlog) {
      lines.push('Site vitrine / blog');
  
      if (d.vitrineBlog.needsBlog) {
        lines.push(`Blog intégré — Fréquence : ${d.vitrineBlog.blogFrequency}`);
        lines.push(`Catégories : ${d.vitrineBlog.blogCategories}`);
      } else {
        lines.push('Pas de blog prévu');
      }
  
      if (d.vitrineBlog.needsBooking) {
        lines.push(`Prise de RDV — Outil : ${d.vitrineBlog.bookingTool}`);
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

    // Pages souhaitées
    if (d.content && d.content.pages) {
      const selectedPages: string[] = [];
      if (d.content.pages.accueil) selectedPages.push('Accueil');
      if (d.content.pages.aPropos) selectedPages.push('À propos');
      if (d.content.pages.services) selectedPages.push('Services');
      if (d.content.pages.blog) selectedPages.push('Blog');
      if (d.content.pages.avis) selectedPages.push('Avis clients');
      if (d.content.pages.contact) selectedPages.push('Contact');
      if (d.content.pages.autre) selectedPages.push(d.content.pages.autre);

      if (selectedPages.length > 0) {
        lines.push(`Pages : ${selectedPages.join(', ')}`);
      }
    }

    // Aide rédaction
    if (d.content && d.content.textHelp) {
      const textLabels: Record<string, string> = {
        'fournis-tout': 'Textes : Client fournit tout',
        'aide-partielle': 'Textes : Aide partielle Meraki [FACTURÉ 15€/page]',
        'redaction-complete': 'Textes : Rédaction complète Meraki [FACTURÉ 35€/page]'
      };
      lines.push(textLabels[d.content.textHelp]);
    }

    // Aide visuels
    if (d.content && d.content.visualsHelp) {
      const visualLabels: Record<string, string> = {
        'fournis-tout': 'Visuels : Client fournit tout',
        'sourcing': 'Visuels : Sourcing Meraki [FACTURÉ 150€]',
        'shooting': 'Visuels : Shooting photo pro Meraki [FACTURÉ sur devis]'
      };
      lines.push(visualLabels[d.content.visualsHelp]);
    }
  
    lines.push('');
  
    /* =======================
       5. DESIGN & RÉFÉRENCES
    ======================= */
    lines.push('5. DESIGN & RÉFÉRENCES');
    lines.push('─────────────────────────────────────────────');
  
    if (d.design && d.design.hasBranding) {
      lines.push(`Charte graphique disponible : ${d.design.brandingLink}`);
    } else {
      lines.push('Pas de charte graphique');
    }
  
    if (d.design && d.design.hasReferences) {
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
       6. OBSERVATIONS CLIENT
    ======================= */
    lines.push('6. OBSERVATIONS COMPLÉMENTAIRES CLIENT');
    lines.push('─────────────────────────────────────────────');
  
    if (d.recap && d.recap.additionalNotes) {
      lines.push(d.recap.additionalNotes);
    } else {
      lines.push('Aucune observation');
    }
  
    lines.push('');
    if (d.recap) {
      lines.push(
        `Demande de rappel : ${d.recap.wantsCallback ? 'OUI' : 'NON'}`
      );
    }

    lines.push('');

    /* =======================
       7. SYNTHÈSE INTERNE MERAKI
    ======================= */
    if (d.internalMeraki) {
      lines.push('7. SYNTHÈSE INTERNE MERAKI');
      lines.push('─────────────────────────────────────────────');

      if (d.internalMeraki.priority) {
        const priorityLabels: Record<string, string> = {
          'faible': 'Priorité : FAIBLE',
          'moyenne': 'Priorité : MOYENNE',
          'elevee': 'Priorité : ÉLEVÉE'
        };
        lines.push(priorityLabels[d.internalMeraki.priority]);
      }

      if (d.internalMeraki.pack) {
        const packLabels: Record<string, string> = {
          'starter': 'Pack conseillé : STARTER',
          'pro': 'Pack conseillé : PRO',
          'sur-mesure': 'Pack conseillé : SUR-MESURE'
        };
        lines.push(packLabels[d.internalMeraki.pack]);
      }

      if (d.internalMeraki.estimationDays) {
        lines.push(`Estimation : ${d.internalMeraki.estimationDays}`);
      }

      if (d.internalMeraki.internalNotes) {
        lines.push('');
        lines.push('NOTES INTERNES :');
        lines.push(d.internalMeraki.internalNotes);
      }

      lines.push('');
    }

    lines.push('═══════════════════════════════════════════════');
    lines.push('          FIN DU CAHIER DES CHARGES');
    lines.push('═══════════════════════════════════════════════');
  
    return lines.join('\n');
  }  
  

  validateAndSend() {
    this.sending = true;
    this.errorMsg = '';

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