"use client";

import { dateBounds } from "@/lib/forms";
import { ConsentField, SelectField, TextAreaField, TextField } from "./Fields";
import { FormShell } from "./FormShell";

const PRIVACY =
  "Vos données servent uniquement à traiter cette demande ; elles ne sont ni revendues ni utilisées pour de la publicité. Vous pouvez en demander la suppression à tout moment (loi ivoirienne n° 2013-450 relative à la protection des données à caractère personnel).";

const TIMES = ["12:00", "12:30", "13:00", "13:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30", "22:00"];

export function ReservationForm({ restaurant }: { restaurant: string }) {
  const { min, max } = dateBounds();
  return (
    <FormShell
      kind="reservation"
      title="Demande de réservation"
      submitLabel="Envoyer ma demande"
      successTitle="Merci, votre demande est bien partie."
      successText={`L'équipe de ${restaurant} vous recontactera pour confirmer la table. La réservation n'est définitive qu'après cette confirmation.`}
    >
      <TextField form="reservation" name="nom" label="Nom complet" required autoComplete="name" />
      <TextField form="reservation" name="telephone" label="Téléphone" type="tel" inputMode="tel" required autoComplete="tel" hint="Ex. 07 00 00 00 00" />
      <TextField form="reservation" name="date" label="Date" type="date" min={min} max={max} required />
      <SelectField
        form="reservation"
        name="heure"
        label="Heure souhaitée"
        required
        hint="Créneaux d'exemple : horaires réels à confirmer."
        options={[{ value: "", label: "Choisir…" }, ...TIMES.map((t) => ({ value: t, label: t.replace(":", " h ") }))]}
      />
      <TextField form="reservation" name="personnes" label="Nombre de personnes" type="number" inputMode="numeric" min={1} max={40} required />
      <SelectField
        form="reservation"
        name="occasion"
        label="Occasion (facultatif)"
        options={[
          { value: "", label: "Aucune en particulier" },
          { value: "anniversaire", label: "Anniversaire" },
          { value: "affaires", label: "Repas d'affaires" },
          { value: "romantique", label: "Dîner en tête-à-tête" },
          { value: "autre", label: "Autre" },
        ]}
      />
      <TextField form="reservation" name="email" label="E-mail (facultatif)" type="email" autoComplete="email" wide />
      <TextAreaField form="reservation" name="message" label="Précisions (facultatif)" hint="Allergies, chaise bébé, terrasse…" maxLength={500} />
      <ConsentField form="reservation">{PRIVACY}</ConsentField>
    </FormShell>
  );
}

export function EventForm({ restaurant }: { restaurant: string }) {
  const { min, max } = dateBounds();
  return (
    <FormShell
      kind="evenement"
      title="Demande pour un événement"
      submitLabel="Envoyer ma demande d'événement"
      successTitle="Merci, votre projet a bien été transmis."
      successText={`L'équipe de ${restaurant} vous recontactera pour étudier les possibilités et vous proposer un devis.`}
    >
      <TextField form="evenement" name="nom" label="Nom complet ou entreprise" required autoComplete="name" />
      <TextField form="evenement" name="telephone" label="Téléphone" type="tel" inputMode="tel" required autoComplete="tel" hint="Ex. 07 00 00 00 00" />
      <SelectField
        form="evenement"
        name="typeEvenement"
        label="Type d'événement"
        required
        options={[
          { value: "", label: "Choisir…" },
          { value: "anniversaire", label: "Anniversaire / fête" },
          { value: "afterwork", label: "Afterwork d'équipe" },
          { value: "affaires", label: "Repas d'affaires / séminaire" },
          { value: "mariage", label: "Mariage / dot / baptême" },
          { value: "privatisation", label: "Privatisation" },
          { value: "autre", label: "Autre" },
        ]}
      />
      <TextField form="evenement" name="date" label="Date envisagée" type="date" min={min} max={max} required />
      <TextField form="evenement" name="invites" label="Nombre d'invités" type="number" inputMode="numeric" min={5} max={500} required />
      <TextField form="evenement" name="email" label="E-mail (facultatif)" type="email" autoComplete="email" />
      <TextAreaField form="evenement" name="message" label="Votre projet" hint="Ambiance souhaitée, horaires, besoins particuliers…" required maxLength={1000} />
      <ConsentField form="evenement">{PRIVACY}</ConsentField>
    </FormShell>
  );
}
