import { NextResponse } from "next/server";
import { enrichWithPageCount } from "@/lib/books/open-library";
import type { BookSearchResult } from "@/types/database";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as BookSearchResult;
    if (!body?.title) {
      return NextResponse.json(
        { error: "title is required" },
        { status: 400 },
      );
    }
    const enriched = await enrichWithPageCount(body);
    return NextResponse.json({ result: enriched });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Enrich failed" },
      { status: 500 },
    );
  }
}
