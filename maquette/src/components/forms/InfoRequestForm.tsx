"use client";

import { ConsentField, SelectField, TextAreaField, TextField } from "./Fields";
import { FormShell } from "./FormShell";

const PRIVACY =
  "Vos données servent uniquement à répondre à cette demande ; elles ne sont ni revendues ni utilisées pour de la publicité, et sont supprimées sur simple demande (loi ivoirienne n° 2013-450). Aucune pièce justificative n'est demandée en ligne.";

type Option = { value: string; label: string };

export function InfoRequestForm({
  organisation,
  units,
  unitLabel,
  profils,
  defaultUnit = "",
}: {
  organisation: string;
  units: Option[];
  unitLabel: string;
  profils: Option[];
  defaultUnit?: string;
}) {
  return (
    <FormShell
      kind="renseignement"
      title="Demande d'information"
      submitLabel="Envoyer ma demande"
      successTitle="Merci, votre demande est bien partie."
      successText={`${organisation} vous recontactera par téléphone ou par e-mail pour répondre à vos questions.`}
    >
      <TextField form="renseignement" name="nom" label="Nom complet" required autoComplete="name" />
      <TextField form="renseignement" name="telephone" label="Téléphone" type="tel" inputMode="tel" required autoComplete="tel" hint="Ex. 07 00 00 00 00" />
      <SelectField form="renseignement" name="profil" label="Vous êtes" required options={[{ value: "", label: "Choisir…" }, ...profils]} />
      <SelectField
        form="renseignement"
        name="unite"
        label={unitLabel}
        required
        defaultValue={defaultUnit}
        options={[{ value: "", label: "Choisir…" }, ...units, { value: "je-ne-sais-pas", label: "Je ne sais pas encore" }]}
      />
      <TextField form="renseignement" name="niveau" label="Niveau / classe visée (facultatif)" maxLength={60} />
      <TextField form="renseignement" name="email" label="E-mail (facultatif)" type="email" autoComplete="email" />
      <TextAreaField form="renseignement" name="message" label="Votre question" required maxLength={1000} hint="Ex. : places disponibles, frais, date de rendez-vous…" />
      <ConsentField form="renseignement">{PRIVACY}</ConsentField>
    </FormShell>
  );
}
