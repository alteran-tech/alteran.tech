"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { siteSettings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// ---------------------------------------------------------------------------
// getSetting -- get a single setting value by key
// ---------------------------------------------------------------------------

export async function getSetting(key: string): Promise<string | null> {
  try {
    const [row] = await db
      .select({ value: siteSettings.value })
      .from(siteSettings)
      .where(eq(siteSettings.key, key))
      .limit(1);
    return row?.value ?? null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// getSettings -- get multiple settings by keys, returns a record
// ---------------------------------------------------------------------------

export async function getSettings(
  keys: string[]
): Promise<Record<string, string>> {
  try {
    const rows = await db
      .select({ key: siteSettings.key, value: siteSettings.value })
      .from(siteSettings);

    return Object.fromEntries(
      rows
        .filter((r) => keys.includes(r.key))
        .map((r) => [r.key, r.value])
    );
  } catch {
    return {};
  }
}

// ---------------------------------------------------------------------------
// setSetting -- upsert a single key-value pair
// ---------------------------------------------------------------------------

async function setSetting(key: string, value: string): Promise<void> {
  const now = new Date().toISOString();
  await db
    .insert(siteSettings)
    .values({ key, value, updatedAt: now })
    .onConflictDoUpdate({
      target: siteSettings.key,
      set: { value, updatedAt: now },
    });
}

// ---------------------------------------------------------------------------
// saveContactSettings -- save GitHub URL and email
// ---------------------------------------------------------------------------

export async function saveContactSettings(data: {
  githubUrl: string;
  email: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    await Promise.all([
      setSetting("contact_github", data.githubUrl.trim()),
      setSetting("contact_email", data.email.trim()),
    ]);

    revalidatePath("/");
    revalidatePath("/admin/settings");

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Не удалось сохранить настройки",
    };
  }
}
