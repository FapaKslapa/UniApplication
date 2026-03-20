import path from "node:path";
import * as dotenv from "dotenv";

dotenv.config({ path: path.join(process.cwd(), ".env.local") });

import { auth } from "@/lib/auth";

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error(
      "ADMIN_EMAIL e ADMIN_PASSWORD devono essere definiti in .env.local",
    );
  }

  console.log(`Creazione utente admin: ${email}`);

  const result = await auth.api.signUpEmail({
    body: { email, password, name: "Admin" },
  });

  if (result && "error" in result && result.error) {
    const message = String(
      (result.error as { message?: string }).message ?? "",
    );
    if (
      message.toLowerCase().includes("already exists") ||
      message.toLowerCase().includes("in use")
    ) {
      console.log("Utente admin già esistente.");
    } else {
      throw new Error(`Errore: ${message}`);
    }
  } else {
    console.log(`Admin creato: ${email}`);
  }
}

seedAdmin()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
