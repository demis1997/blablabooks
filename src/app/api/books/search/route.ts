import { NextResponse } from "next/server";
import { searchBooks } from "@/lib/books/search";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";
  const page = Number.parseInt(searchParams.get("page") ?? "1", 10) || 1;
  const limit = Math.min(
    20,
    Math.max(1, Number.parseInt(searchParams.get("limit") ?? "12", 10) || 12),
  );

  if (q.length < 2) {
    return NextResponse.json({ results: [], total: 0, page, limit });
  }

  try {
    const { results, total } = await searchBooks(q, {
      page,
      limit,
      enrichPageCount: true,
      includeGoogleFallback: true,
    });
    return NextResponse.json({ results, total, page, limit });
  } catch (e) {
    return NextResponse.json(
      {
        results: [],
        total: 0,
        page,
        limit,
        error: e instanceof Error ? e.message : "Search failed",
      },
      { status: 500 },
    );
  }
}
