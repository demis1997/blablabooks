import type { MonthlyDraw } from "@/types/database";
import {
  appendDemoActivity,
  getDemoBooks,
  getDemoDraws,
  mutateDemoStore,
} from "@/lib/demo-data";
import { applyDrawConfirmation } from "@/lib/books/draw-logic";
import { filterEligibleCandidates, pickRandomBookId } from "@/lib/books/random";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import type { DrawConfirmInput } from "@/lib/validations/book";
import { getCandidateBooks } from "./books";

export async function listDraws(): Promise<MonthlyDraw[]> {
  if (!isSupabaseConfigured()) {
    return [...getDemoDraws()].sort((a, b) =>
      b.year === a.year ? b.month - a.month : b.year - a.year,
    );
  }

  const supabase = await createClient();
  if (!supabase) {
    return [...getDemoDraws()].sort((a, b) =>
      b.year === a.year ? b.month - a.month : b.year - a.year,
    );
  }

  const { data, error } = await supabase
    .from("monthly_draws")
    .select("*")
    .order("year", { ascending: false })
    .order("month", { ascending: false });

  if (error) {
    throw new Error(`Failed to list draws: ${error.message}`);
  }

  return (data ?? []) as MonthlyDraw[];
}

export async function getLatestDraw(): Promise<MonthlyDraw | null> {
  const draws = await listDraws();
  return draws[0] ?? null;
}

export async function getDrawById(id: string): Promise<MonthlyDraw | null> {
  if (!isSupabaseConfigured()) {
    return getDemoDraws().find((d) => d.id === id) ?? null;
  }

  const supabase = await createClient();
  if (!supabase) {
    return getDemoDraws().find((d) => d.id === id) ?? null;
  }

  const { data, error } = await supabase
    .from("monthly_draws")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to get draw: ${error.message}`);
  }

  return (data as MonthlyDraw | null) ?? null;
}

export type CreateDrawPreviewInput = {
  month: number;
  year: number;
  excluded_book_ids?: string[];
  notes?: string | null;
};

export async function createDrawPreview(
  input: CreateDrawPreviewInput,
): Promise<MonthlyDraw> {
  const excluded = input.excluded_book_ids ?? [];
  const candidates = isSupabaseConfigured()
    ? await getCandidateBooks()
    : getDemoBooks();
  const eligible = filterEligibleCandidates(candidates, excluded);
  const pool = eligible.map((b) => b.id);
  const selectedId = pickRandomBookId(pool);
  const now = new Date().toISOString();

  const draw: MonthlyDraw = {
    id: crypto.randomUUID(),
    month: input.month,
    year: input.year,
    status: "preview",
    selected_book_id: selectedId,
    eligible_book_ids: pool,
    excluded_book_ids: excluded,
    confirmed_at: null,
    admin_id: null,
    notes: input.notes ?? null,
    created_at: now,
    updated_at: now,
  };

  if (!isSupabaseConfigured()) {
    mutateDemoStore((draft) => {
      draft.draws = [draw, ...draft.draws];
    });
    appendDemoActivity({
      admin_id: null,
      action: "draw.preview",
      entity_type: "monthly_draw",
      entity_id: draw.id,
      details: {
        selected_book_id: selectedId,
        month: input.month,
        year: input.year,
      },
    });
    return draw;
  }

  const supabase = await createClient();
  if (!supabase) throw new Error("Supabase client unavailable");

  const { data, error } = await supabase
    .from("monthly_draws")
    .insert({
      month: draw.month,
      year: draw.year,
      status: draw.status,
      selected_book_id: draw.selected_book_id,
      eligible_book_ids: draw.eligible_book_ids,
      excluded_book_ids: draw.excluded_book_ids,
      notes: draw.notes,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(`Failed to create draw preview: ${error.message}`);
  }

  return data as MonthlyDraw;
}

export async function confirmDraw(
  input: DrawConfirmInput,
): Promise<MonthlyDraw> {
  const now = new Date().toISOString();

  const existing = await getDrawById(input.draw_id);
  if (!existing) {
    throw new Error(`Draw not found: ${input.draw_id}`);
  }
  if (existing.status === "confirmed") {
    throw new Error("This draw has already been confirmed.");
  }

  if (!isSupabaseConfigured()) {
    let confirmed: MonthlyDraw | null = null;
    mutateDemoStore((draft) => {
      const index = draft.draws.findIndex((d) => d.id === input.draw_id);
      if (index === -1) return;
      const current = draft.draws[index]!;
      if (current.status === "confirmed") return;
      const next: MonthlyDraw = {
        ...current,
        status: "confirmed",
        selected_book_id: input.selected_book_id,
        month: input.month,
        year: input.year,
        notes: input.notes ?? current.notes,
        excluded_book_ids:
          input.excluded_book_ids ?? current.excluded_book_ids,
        eligible_book_ids:
          input.eligible_book_ids ?? current.eligible_book_ids,
        confirmed_at: now,
        updated_at: now,
        admin_id: current.admin_id,
      };
      draft.draws[index] = next;

      const { updatedBooks } = applyDrawConfirmation({
        books: draft.books,
        selectedBookId: input.selected_book_id,
        month: input.month,
        year: input.year,
        now,
      });
      draft.books = updatedBooks;

      confirmed = next;
    });

    if (!confirmed) {
      throw new Error(`Draw not found: ${input.draw_id}`);
    }

    appendDemoActivity({
      admin_id: null,
      action: "draw.confirmed",
      entity_type: "monthly_draw",
      entity_id: input.draw_id,
      details: { selected_book_id: input.selected_book_id },
    });
    return confirmed;
  }

  const supabase = await createClient();
  if (!supabase) throw new Error("Supabase client unavailable");

  const { data, error } = await supabase
    .from("monthly_draws")
    .update({
      status: "confirmed",
      selected_book_id: input.selected_book_id,
      month: input.month,
      year: input.year,
      notes: input.notes ?? null,
      excluded_book_ids: input.excluded_book_ids ?? [],
      eligible_book_ids: input.eligible_book_ids,
      confirmed_at: now,
    })
    .eq("id", input.draw_id)
    .select("*")
    .single();

  if (error) {
    throw new Error(`Failed to confirm draw: ${error.message}`);
  }

  await supabase
    .from("books")
    .update({ status: "previously_read" })
    .eq("status", "currently_reading")
    .eq("is_archived", false);

  await supabase
    .from("books")
    .update({
      status: "currently_reading",
      selected_month: input.month,
      selected_year: input.year,
    })
    .eq("id", input.selected_book_id);

  return data as MonthlyDraw;
}
