import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';

const DRAFT_KEY = 'client-intake:draft:v1';

@Injectable({ providedIn: 'root' })
export class FormService {
  readonly form: FormGroup;
  private readonly isBrowser: boolean;

  constructor(
    private fb: FormBuilder,
    @Inject(PLATFORM_ID) platformId: object
  ) {
    this.isBrowser = isPlatformBrowser(platformId)
    this.form = this.fb.group({
      client: this.fb.group({
        firstName: ['', Validators.required],
        lastName: ['', Validators.required],
        company: [''],
        sector: [''],
        email: ['', [Validators.required, Validators.email]],
        phone: [''],
        hasWebsite: [null, Validators.required],
        websiteUrl: [{ value: '', disabled: true }],
      }),
      project: this.fb.group({
        type: [null, Validators.required],
        otherTypeLabel: [''],
      }),
      vitrineBlog: this.fb.group({
        needsBlog: [null],                 // boolean | null
        blogFrequency: [''],               // requis si needsBlog=true
        blogCategories: [''],              // requis si needsBlog=true
        needsBooking: [null],              // boolean | null
        bookingTool: [''],                 // requis si needsBooking=true
        connectAgenda: [null],             // boolean | null (optionnel)
        agendaType: [''],                  // requis si connectAgenda=true
      }),
      ecommerce: this.fb.group({
        productCount: [null],              // requis
        manageStock: [null],               // boolean | null
        payments: this.fb.group({
          cb: [false],
          paypal: [false],
          stripe: [false],
          other: [false],
          otherLabel: [''],                // requis si other=true
        }),
        shipsFranceOnly: [null],           // boolean | null
        countries: [''],                   // requis si shipsFranceOnly=false
      }),
      content: this.fb.group({
        hasContent: [null, Validators.required], // 'oui' | 'partiellement' | 'non'
        sendMethod: [{ value: '', disabled: true }], // requis si hasContent='oui'
        needsCopywriting: [{ value: null, disabled: true }], // requis si hasContent!='oui'
        needsVisualHelp: [{ value: null, disabled: true }],  // requis si hasContent!='oui'
      }),      
      design: this.fb.group({
        hasBranding: [null, Validators.required],          // boolean | null
        brandingLink: [{ value: '', disabled: true }],     // requis si hasBranding=true
      
        hasReferences: [null, Validators.required],        // boolean | null
        references: this.fb.group({
          ref1Url: [{ value: '', disabled: true }],
          ref1Notes: [{ value: '', disabled: true }],
          ref2Url: [{ value: '', disabled: true }],
          ref2Notes: [{ value: '', disabled: true }],
          ref3Url: [{ value: '', disabled: true }],
          ref3Notes: [{ value: '', disabled: true }],
        }),
      }),      
      budget: this.fb.group({
        range: [null, Validators.required],   // 'lt1000' | '1000-2500' | '2500-5000' | 'gt5000'
        timeline: [null, Validators.required] // 'asap' | '1-2m' | '3-4m' | 'no-deadline'
      }),

      recap: this.fb.group({
        additionalNotes: [''],              // message libre
        wantsCallback: [false],             // checkbox
      }),      
    });

    this.restoreDraft();
    this.setupConditionalControls();
    this.setupBranchingLogic();
    this.setupContentLogic();
    this.setupAutosave();
    this.setupDesignLogic();
  }

  private setupConditionalControls() {
    const client = this.form.get('client') as FormGroup;
    const hasWebsite = client.get('hasWebsite')!;
    const websiteUrl = client.get('websiteUrl')!;

    hasWebsite.valueChanges.subscribe((v: boolean | null) => {
      if (v === true) {
        websiteUrl.enable({ emitEvent: false });
      } else {
        websiteUrl.disable({ emitEvent: false });
        websiteUrl.reset('', { emitEvent: false });
      }
    });

    // Appliquer l’état correct au chargement (draft)
    const current = hasWebsite.value;
    if (current === true) websiteUrl.enable({ emitEvent: false });
    else websiteUrl.disable({ emitEvent: false });
  }

  private setupBranchingLogic() {
    // VITRINE / BLOG
    const vb = this.form.get('vitrineBlog') as FormGroup;
    const needsBlog = vb.get('needsBlog')!;
    const blogFrequency = vb.get('blogFrequency')!;
    const blogCategories = vb.get('blogCategories')!;
  
    const needsBooking = vb.get('needsBooking')!;
    const bookingTool = vb.get('bookingTool')!;
    const connectAgenda = vb.get('connectAgenda')!;
    const agendaType = vb.get('agendaType')!;
  
    const applyBlogRules = (v: boolean | null) => {
      if (v === true) {
        blogFrequency.setValidators([Validators.required]);
        blogCategories.setValidators([Validators.required]);
        blogFrequency.enable({ emitEvent: false });
        blogCategories.enable({ emitEvent: false });
      } else {
        blogFrequency.clearValidators();
        blogCategories.clearValidators();
        blogFrequency.setValue('', { emitEvent: false });
        blogCategories.setValue('', { emitEvent: false });
        blogFrequency.disable({ emitEvent: false });
        blogCategories.disable({ emitEvent: false });
      }
      blogFrequency.updateValueAndValidity({ emitEvent: false });
      blogCategories.updateValueAndValidity({ emitEvent: false });
    };
  
    const applyBookingRules = (v: boolean | null) => {
      if (v === true) {
        bookingTool.setValidators([Validators.required]);
        bookingTool.enable({ emitEvent: false });
      } else {
        bookingTool.clearValidators();
        bookingTool.setValue('', { emitEvent: false });
        bookingTool.disable({ emitEvent: false });
  
        // si pas de booking, on neutralise aussi l'agenda
        connectAgenda.setValue(null, { emitEvent: false });
        agendaType.clearValidators();
        agendaType.setValue('', { emitEvent: false });
        agendaType.disable({ emitEvent: false });
        agendaType.updateValueAndValidity({ emitEvent: false });
      }
      bookingTool.updateValueAndValidity({ emitEvent: false });
    };
  
    const applyAgendaRules = (v: boolean | null) => {
      if (v === true) {
        agendaType.setValidators([Validators.required]);
        agendaType.enable({ emitEvent: false });
      } else {
        agendaType.clearValidators();
        agendaType.setValue('', { emitEvent: false });
        agendaType.disable({ emitEvent: false });
      }
      agendaType.updateValueAndValidity({ emitEvent: false });
    };
  
    needsBlog.valueChanges.subscribe(applyBlogRules);
    needsBooking.valueChanges.subscribe(applyBookingRules);
    connectAgenda.valueChanges.subscribe(applyAgendaRules);
  
    // E-COMMERCE
    const ec = this.form.get('ecommerce') as FormGroup;
    const productCount = ec.get('productCount')!;
    const shipsFranceOnly = ec.get('shipsFranceOnly')!;
    const countries = ec.get('countries')!;
    const payments = ec.get('payments') as FormGroup;
    const payOther = payments.get('other')!;
    const payOtherLabel = payments.get('otherLabel')!;
  
    // validators "statiques"
    productCount.setValidators([Validators.required]);
  
    const applyShippingRules = (v: boolean | null) => {
      if (v === false) {
        countries.setValidators([Validators.required]);
        countries.enable({ emitEvent: false });
      } else {
        countries.clearValidators();
        countries.setValue('', { emitEvent: false });
        countries.disable({ emitEvent: false });
      }
      countries.updateValueAndValidity({ emitEvent: false });
    };
  
    const applyPaymentOtherRules = (v: boolean) => {
      if (v === true) {
        payOtherLabel.setValidators([Validators.required]);
        payOtherLabel.enable({ emitEvent: false });
      } else {
        payOtherLabel.clearValidators();
        payOtherLabel.setValue('', { emitEvent: false });
        payOtherLabel.disable({ emitEvent: false });
      }
      payOtherLabel.updateValueAndValidity({ emitEvent: false });
    };
  
    shipsFranceOnly.valueChanges.subscribe(applyShippingRules);
    payOther.valueChanges.subscribe(applyPaymentOtherRules);
  
    // Appliquer au chargement (draft)
    applyBlogRules(needsBlog.value);
    applyBookingRules(needsBooking.value);
    applyAgendaRules(connectAgenda.value);
    applyShippingRules(shipsFranceOnly.value);
    applyPaymentOtherRules(!!payOther.value);
  }
  
  private setupContentLogic() {
    const content = this.form.get('content') as FormGroup;
  
    const hasContent = content.get('hasContent')!;
    const sendMethod = content.get('sendMethod')!;
    const needsCopywriting = content.get('needsCopywriting')!;
    const needsVisualHelp = content.get('needsVisualHelp')!;
  
    const apply = (v: 'oui' | 'partiellement' | 'non' | null) => {
      if (v === 'oui') {
        // On veut uniquement "comment nous envoyer les contenus"
        sendMethod.setValidators([Validators.required]);
        sendMethod.enable({ emitEvent: false });
  
        needsCopywriting.clearValidators();
        needsVisualHelp.clearValidators();
  
        needsCopywriting.setValue(null, { emitEvent: false });
        needsVisualHelp.setValue(null, { emitEvent: false });
        needsCopywriting.disable({ emitEvent: false });
        needsVisualHelp.disable({ emitEvent: false });
  
        needsCopywriting.updateValueAndValidity({ emitEvent: false });
        needsVisualHelp.updateValueAndValidity({ emitEvent: false });
        sendMethod.updateValueAndValidity({ emitEvent: false });
        return;
      }
  
      if (v === 'partiellement' || v === 'non') {
        // On désactive "sendMethod" et on demande l'aide
        sendMethod.clearValidators();
        sendMethod.setValue('', { emitEvent: false });
        sendMethod.disable({ emitEvent: false });
  
        needsCopywriting.setValidators([Validators.required]);
        needsVisualHelp.setValidators([Validators.required]);
        needsCopywriting.enable({ emitEvent: false });
        needsVisualHelp.enable({ emitEvent: false });
  
        sendMethod.updateValueAndValidity({ emitEvent: false });
        needsCopywriting.updateValueAndValidity({ emitEvent: false });
        needsVisualHelp.updateValueAndValidity({ emitEvent: false });
        return;
      }
  
      // null (non répondu)
      sendMethod.clearValidators();
      sendMethod.setValue('', { emitEvent: false });
      sendMethod.disable({ emitEvent: false });
  
      needsCopywriting.clearValidators();
      needsVisualHelp.clearValidators();
      needsCopywriting.setValue(null, { emitEvent: false });
      needsVisualHelp.setValue(null, { emitEvent: false });
      needsCopywriting.disable({ emitEvent: false });
      needsVisualHelp.disable({ emitEvent: false });
  
      sendMethod.updateValueAndValidity({ emitEvent: false });
      needsCopywriting.updateValueAndValidity({ emitEvent: false });
      needsVisualHelp.updateValueAndValidity({ emitEvent: false });
    };
  
    hasContent.valueChanges.subscribe(apply);
    apply(hasContent.value);
  }
  

  private setupAutosave() {
    this.form.valueChanges
      .pipe(debounceTime(400), distinctUntilChanged())
      .subscribe(() => this.saveDraft());
  }

  private setupDesignLogic() {
    const design = this.form.get('design') as FormGroup;
  
    const hasBranding = design.get('hasBranding')!;
    const brandingLink = design.get('brandingLink')!;
  
    const hasReferences = design.get('hasReferences')!;
    const refs = design.get('references') as FormGroup;
  
    const ref1Url = refs.get('ref1Url')!;
    const ref1Notes = refs.get('ref1Notes')!;
    const ref2Url = refs.get('ref2Url')!;
    const ref2Notes = refs.get('ref2Notes')!;
    const ref3Url = refs.get('ref3Url')!;
    const ref3Notes = refs.get('ref3Notes')!;
  
    const allRefCtrls = [ref1Url, ref1Notes, ref2Url, ref2Notes, ref3Url, ref3Notes];
  
    const applyBranding = (v: boolean | null) => {
      if (v === true) {
        brandingLink.setValidators([Validators.required]);
        brandingLink.enable({ emitEvent: false });
      } else {
        brandingLink.clearValidators();
        brandingLink.setValue('', { emitEvent: false });
        brandingLink.disable({ emitEvent: false });
      }
      brandingLink.updateValueAndValidity({ emitEvent: false });
    };
  
    const applyReferences = (v: boolean | null) => {
      if (v === true) {
        // On exige au moins 1 URL (ref1)
        ref1Url.setValidators([Validators.required]);
        ref1Url.enable({ emitEvent: false });
  
        // Notes optionnelles mais activées
        ref1Notes.enable({ emitEvent: false });
        ref2Url.enable({ emitEvent: false });
        ref2Notes.enable({ emitEvent: false });
        ref3Url.enable({ emitEvent: false });
        ref3Notes.enable({ emitEvent: false });
      } else {
        // On neutralise tout
        ref1Url.clearValidators();
        allRefCtrls.forEach(c => {
          c.setValue('', { emitEvent: false });
          c.disable({ emitEvent: false });
          c.updateValueAndValidity({ emitEvent: false });
        });
      }
  
      ref1Url.updateValueAndValidity({ emitEvent: false });
    };
  
    hasBranding.valueChanges.subscribe(applyBranding);
    hasReferences.valueChanges.subscribe(applyReferences);
  
    // appliquer au chargement (draft)
    applyBranding(hasBranding.value);
    applyReferences(hasReferences.value);
  }  

  saveDraft() {
    if (!this.isBrowser) return;
    const payload = this.form.getRawValue(); // inclut champs disabled (utile si tu changes d'avis)
    localStorage.setItem(DRAFT_KEY, JSON.stringify(payload));
  }

  restoreDraft() {
    if (!this.isBrowser) return;
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return;

    try {
      const data = JSON.parse(raw);
      this.form.patchValue(data, { emitEvent: false });
    } catch {
      // draft corrompu : on ignore
    }
  }

  clearDraft() {
    localStorage.removeItem(DRAFT_KEY);
  }

  resetAll() {
    // Vide le formulaire en mémoire
    this.form.reset();

    // Supprime la sauvegarde "reprendre plus tard"
    this.clearDraft();
  }
}