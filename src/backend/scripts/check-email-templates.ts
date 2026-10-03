import assert from "node:assert/strict";
import { parseWeddingDate } from "@backend/modules/mailing/wedding-date";
import { DEFAULT_TEMPLATES, renderTemplate, renderBody, sampleVars, TEMPLATE_KEYS } from "@backend/modules/mailing/templates";

// Dates de mariage telles que saisies par les clientes (vues dans la base)
const cases: [string | null, string | null][] = [
    ["23.04.2027", "2027-04-23"], ["02/01/2027", "2027-01-02"], ["10/07/2027", "2027-07-10"], ["02.01/2027", "2027-01-02"],
    ["11 juin 2027", "2027-06-11"], ["1er août 2027", "2027-08-01"], ["2027-06-11", "2027-06-11"], ["5/6/27", "2027-06-05"],
    ["été 2027", null], ["juin 2027", null], ["31/02/2027", null], ["", null], [null, null],
];
for (const [input, expected] of cases) assert.equal(parseWeddingDate(input), expected, `parse ${input}`);
console.log(`dates de mariage : ${cases.length} cas OK`);

// Rendu : intertitres, boutons, variables
const html = renderBody("Bonjour {{prénom}},\n\n✨ Les accessoires\n\n📅 Date : {{date_rdv}}\n🕐 Heure : {{heure_rdv}}\n\n👉 {{lien_annulation}}\n\nL’équipe UMEL COUTURE", {
    prenom: "Camille", date_rdv: "jeudi 15 octobre 2026", heure_rdv: "14h00", lien_annulation: "https://x.fr/m/abc",
});
assert.match(html, /Bonjour Camille,/);
assert.match(html, /font-weight:bold[^>]*>✨ Les accessoires/);
assert.match(html, /jeudi 15 octobre 2026<br>🕐 Heure : 14h00/);
assert.match(html, /<a href="https:\/\/x\.fr\/m\/abc"[^>]*>Déplacer ou annuler mon rendez-vous<\/a>/);
assert.doesNotMatch(html, /font-weight:bold[^>]*>L’équipe/);
console.log("rendu (intertitre, bouton, variables) OK");

// Les 7 modèles d'origine : aucune variable oubliée, sujet et titre présents
for (const key of TEMPLATE_KEYS) {
    const t = DEFAULT_TEMPLATES[key];
    const mail = renderTemplate({ key, subject: t.subject, title: t.title, body: t.body }, sampleVars());
    assert.doesNotMatch(mail.html, /\{\{|\}\}/, `${key} : variable non remplacée`);
    assert.ok(mail.subject && mail.html.includes("Camille"), key);
}
const conf = renderTemplate({ key: "CONFIRMATION", ...DEFAULT_TEMPLATES.CONFIRMATION }, sampleVars());
assert.match(conf.html, /Déplacer ou annuler mon rendez-vous/, "confirmation : bouton de gestion");
const thanks = renderTemplate({ key: "THANK_YOU", ...DEFAULT_TEMPLATES.THANK_YOU }, sampleVars());
assert.match(thanks.html, /writereview\?placeid=/, "merci : lien avis Google");
console.log(`7 modèles OK (variables toutes remplacées, bouton de gestion, lien avis Google)`);
