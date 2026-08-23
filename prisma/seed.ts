/**
 * PRODUKTIONS-Seed: legt ausschließlich den ersten Manager-Zugang an.
 * Kein Beispiel-Kader, keine Beispiel-Spiele — der Kader startet komplett leer.
 * Als Manager fügst du danach über "Admin/Manager → Kader" eure echten Spieler hinzu.
 *
 * Der erste Manager-Zugang wird über Umgebungsvariablen konfiguriert (optional):
 *   INITIAL_MANAGER_NAME, INITIAL_MANAGER_EMAIL, INITIAL_MANAGER_PASSWORD
 * Sind sie nicht gesetzt, werden sinnvolle Standardwerte verwendet (siehe unten) —
 * das Passwort sollte danach umgehend unter "Profil → Passwort ändern" geändert werden.
 *
 * Ausführen mit: npm run db:seed
 * (Für Testdaten/Demo-Kader stattdessen: npm run db:seed:demo)
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const name = process.env.INITIAL_MANAGER_NAME || "Manager";
  const email = (process.env.INITIAL_MANAGER_EMAIL || "manager@wacker-esports.de").toLowerCase().trim();
  const password = process.env.INITIAL_MANAGER_PASSWORD || "Manager2026!";

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`ℹ️  Es existiert bereits ein Benutzer mit der E-Mail ${email} — nichts verändert.`);
    return;
  }

  const user = await prisma.user.create({
    data: {
      email,
      name,
      passwordHash: await bcrypt.hash(password, 10),
      role: "MANAGER",
    },
  });

  await prisma.player.create({
    data: {
      userId: user.id,
      gamerTag: name,
      realName: name,
      squadRole: "MANAGER",
      status: "AVAILABLE",
    },
  });

  console.log("✅ Erster Manager-Zugang wurde angelegt. Der Kader ist leer und bereit für eure echten Spieler.");
  console.log("");
  console.log(`   E-Mail:   ${email}`);
  console.log(`   Passwort: ${password}`);
  console.log("");
  console.log("   Bitte gleich nach dem ersten Login unter „Profil → Passwort ändern“ ein eigenes Passwort setzen.");
  console.log("   Weitere Spieler/Captains fügst du unter „Admin/Manager → Kader → Spieler hinzufügen“ hinzu.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
