"use server";

import { revalidatePath } from "next/cache";
import { getLocale } from "next-intl/server";
import type { Book, MonthlyDraw } from "@/types/database";
import {
  confirmDraw as confirmDrawRecord,
  createDrawPreview,
  listDraws,
} from "@/lib/data/draws";
import { getBookById } from "@/lib/data/books";
import { getAdminId, requireAdmin } from "@/lib/supabase/auth";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { mutateDemoStore } from "@/lib/demo-data";
import { drawConfirmSchema } from "@/lib/validations/book";

export type DrawActionResult<T = unknown> = {
  ok: boolean;
  error?: string;
  data?: T;
};

export async function pickDraw(input: {
  month: number;
  year: number;
  excluded_book_ids?: string[];
  notes?: string | null;
}): Promise<DrawActionResult<{ draw: MonthlyDraw; book: Book | null }>> {
  await requireAdmin();

  try {
    const draw = await createDrawPreview({
      month: input.month,
      year: input.year,
      excluded_book_ids: input.excluded_book_ids ?? [],
      notes: input.notes,
    });

    const book = draw.selected_book_id
      ? await getBookById(draw.selected_book_id)
      : null;

    return { ok: true, data: { draw, book } };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Draw failed",
    };
  }
}

export async function confirmDraw(input: {
  draw_id: string;
  selected_book_id: string;
  month: number;
  year: number;
  notes?: string | null;
  excluded_book_ids?: string[];
  eligible_book_ids?: string[];
}): Promise<DrawActionResult<MonthlyDraw>> {
  const session = await requireAdmin();
  const parsed = drawConfirmSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid draw",
    };
  }

  try {
    const draw = await confirmDrawRecord(parsed.data);

    // Stamp admin id on the confirmed draw (demo + supabase path)
    const adminId = session.profile.id;
    if (!isSupabaseConfigured()) {
      mutateDemoStore((draft) => {
        const index = draft.draws.findIndex((d) => d.id === draw.id);
        if (index !== -1) {
          draft.draws[index] = { ...draft.draws[index]!, admin_id: adminId };
        }
      });
    }

    const locale = await getLocale();
    revalidatePath(`/${locale}/admin/randomizer`);
    revalidatePath(`/${locale}/admin/current-book`);
    revalidatePath(`/${locale}/admin`);
    revalidatePath(`/${locale}`);
    revalidatePath(`/${locale}/books`);
    revalidatePath(`/${locale}/randomizer`);

    return { ok: true, data: { ...draw, admin_id: adminId } };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Confirm failed",
    };
  }
}

export async function getDrawHistory(): Promise<MonthlyDraw[]> {
  await requireAdmin();
  return listDraws();
}

export async function cancelDrawPreview(
  drawId: string,
): Promise<DrawActionResult> {
  await requireAdmin();
  // Preview draws can remain; UI simply discards the selection.
  void drawId;
  void (await getAdminId());
  return { ok: true };
}
