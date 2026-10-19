import type { Step } from "./types";

/** ADMISSIONS — parcours de démonstration, à valider par l'institut. */
export const admissionSteps: Step[] = [
  { title: "Choisir sa formation", text: "Comparez les filières par domaine et par niveau." },
  { title: "Demander des renseignements", text: "Envoyez une demande en ligne : l'institut vous recontacte." },
  { title: "Constituer le dossier", text: "Pièces à déposer auprès de l'institut (liste officielle à confirmer)." },
  { title: "Confirmer l'inscription", text: "Validation du dossier et inscription selon les modalités officielles." },
];

export const admissionDocuments = [
  "Copie du diplôme ou relevé du baccalauréat (à confirmer)",
  "Extrait d'acte de naissance (à confirmer)",
  "Photos d'identité (nombre à confirmer)",
  "Bulletins ou relevés de notes de l'année précédente (à confirmer)",
];

export const admissionFaq = [
  { q: "Quel niveau faut-il pour entrer en BTS ?", a: "Le baccalauréat est généralement requis ; les séries acceptées par filière sont à confirmer par l'institut." },
  { q: "Quand ont lieu les inscriptions ?", a: "Le calendrier officiel sera publié ici (donnée à confirmer)." },
  { q: "Faut-il envoyer des documents en ligne ?", a: "Non. Cette maquette ne collecte aucune pièce personnelle : le dossier se dépose auprès de l'institut." },
  { q: "Peut-on poursuivre après le BTS ?", a: "Une licence professionnelle (bac+3) est mentionnée par les sources publiques ; spécialités à confirmer." },
];
