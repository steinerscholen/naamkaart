# Naamkaart

A local-first web app for generating student ID badge sticker sheets, bicycle pass (fietspas) badges, and event name tags — built for Steiner schools.

**All data stays on your device.** No server, no cloud, no account. Photos, names and CSV exports are processed entirely in the browser and stored locally.

---

## What it does

- **Student badges** — import a Smartschool CSV, match portrait photos, and print ready-to-cut sticker sheets (PDF) in any Avery/Herma/Zweckform label format
- **Fietspas** — mark students who may borrow a school bicycle; print the same badge in a different colour with one click
- **Naamkaartjes** — generate event name tags for staff or guests (large name, role, school logo); 10 per A4 page, landscape 90 × 55 mm
- Configurable layout — badge size, number of columns/rows, margins, gap; built-in presets for common label sheets
- Custom font — upload any TTF to apply your school's typeface to both the on-screen preview and the PDF
- Partial sheet support — track which sticker positions are already used so you never waste a sheet

---

## Privacy

Student photos and personal data **never leave your browser**. The app has no network calls, no analytics, and no login. Everything is saved in `localStorage` on the computer you run it on.

---

## Installation

You need [Node.js](https://nodejs.org) (v18 or higher) installed.

```bash
# 1. Clone the repository
git clone https://github.com/steinerscholen/naamkaart.git
cd naamkaart

# 2. Install dependencies
npm install

# 3. Start the app
npm run dev
```

Then open **http://localhost:5173** in your browser.

To build a static version you can host on a local server or intranet:

```bash
npm run build
# output goes to the dist/ folder
```

---

## Manual

### 1 · Instellingen (Settings)

Set these up first — they are applied to every badge and name tag.

| Setting | Description |
|---|---|
| Naam school | Shown on the badge strip |
| Website | Shown at the bottom of each badge |
| Schooljaar | e.g. `2025-2026`, shown top-right on the strip |
| Logo | PNG or JPG; displayed in the strip next to the year |
| Accentkleur | Background colour of the badge header strip |
| Tekstkleur strip | Text colour used inside the strip |
| Lettertype (TTF) | Upload a .ttf font; applied everywhere |
| Fietspas kleuren | Separate accent colour for bicycle pass badges |
| Stickervel formaat | Choose a preset (Avery, Herma, Zweckform) or enter your own dimensions |

> **Tip:** The coloured preview bar under the colour pickers shows exactly how the strip will look before you print.

---

### 2 · Leerlingen (Students)

**Import from Smartschool**

1. Export a student list from Smartschool as CSV (UTF-8 or Windows-1252 — both are handled automatically).
2. Click **CSV importeren**, select the file, and map the columns (first name, last name, class, date of birth).
3. Click **importeren** to add the students.

**Add photos**

- Click **Foto's koppelen**, select a folder of portrait images.
- The app matches photos to students by filename (`Achternaam_Voornaam.jpg` or similar).
- Unmatched photos can be assigned manually from the list.

**Fietspas**

Click the 🚲 button on any student row to mark them as a fietspas holder. The green badge appears on their name and they will appear in the Fietspas print mode.

---

### 3 · Afdrukken (Print — student badges)

1. Use the search box or class buttons to filter students.
2. Use the **Foto** filter to show only students with or without a photo.
3. Toggle **Leerlingenbadge / 🚲 Fietspas** to switch between badge types.
4. Tick the students you want to print (or click **Alles**).
5. Choose **Nieuw vel** (fresh sticker sheet) or **Bestaand vel** (continue a partially-used sheet).
6. Enable **Afdrukken per klas** if you want each class to start on a new page.
7. Click **PDF genereren** — the file downloads immediately.

The app records which sticker positions were used. On your next print run you can select the same sheet and it will automatically fill the remaining slots.

---

### 4 · Naamkaartjes (Name tags)

For events, parent evenings, or staff badges.

1. Click **+ Persoon toevoegen** to add someone manually, or use **CSV importeren** with a simple file containing first name, last name, and optionally a role/department column.
2. Select the people you want to print.
3. Click **PDF genereren**.

Name tags are printed 2 per row × 5 per page (10 per A4 sheet) at 90 × 55 mm. Colours, font and logo are taken from Settings.

---

## Label sheet presets

| Preset | Size | Grid |
|---|---|---|
| Avery 3475 / Zweckform 3422 | 70 × 37 mm | 3 × 8 = 24 |
| Avery L7160 / J8160 | 63.5 × 38.1 mm | 3 × 7 = 21 |
| Avery 3666 | 65 × 33.9 mm | 3 × 9 = 27 |
| Avery L4736 | 63.5 × 25.4 mm | 4 × 12 = 48 |
| Herma 4201 | 70 × 42.3 mm | 3 × 7 = 21 |
| Herma 4200 | 105 × 42.3 mm | 2 × 7 = 14 |

Always verify dimensions against the actual packaging before printing a full batch.

---

## Tech stack

| | |
|---|---|
| Framework | React 18 + TypeScript |
| Build tool | Vite |
| Styling | Tailwind CSS |
| PDF generation | jsPDF |
| CSV parsing | PapaParse |
| Storage | Browser `localStorage` — no backend |

---

## Contributing

Pull requests are welcome. Please do not commit any school-specific assets (logos, fonts, CSV files, photos) — see `.gitignore`.

---

## Licence

MIT
