export type ProjectType = 'vitrine' | 'ecommerce' | 'blog' | 'autre';

export interface IntakeDraft {
  client: {
    firstName: string;
    lastName: string;
    company: string;
    sector: string;
    email: string;
    phone: string;
    hasWebsite: boolean | null;
    websiteUrl: string;
  };
  project: {
    type: ProjectType | null;
    otherTypeLabel: string;
  };
  // Les sections suivantes seront remplies aux prochaines étapes
  vitrineBlog: Record<string, unknown>;
  ecommerce: Record<string, unknown>;
  content: Record<string, unknown>;
  design: Record<string, unknown>;
  budget: Record<string, unknown>;
  recap: Record<string, unknown>;
}