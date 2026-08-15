import { NextResponse } from "next/server";

const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "deebstore-c8bfa";
const API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyAGbFTxHQuEqb9X8XN4OMhARbzoD3yvxX4";
const BASE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

// Server-side persistent fallback memory cache
let globalCategoriesCache: any[] = [];

function parseFirestoreDoc(doc: any) {
  if (!doc || !doc.fields) return null;
  const nameParts = doc.name ? doc.name.split("/") : [];
  const id = nameParts[nameParts.length - 1];

  const fields: Record<string, any> = {};
  for (const [key, valObj] of Object.entries(doc.fields as Record<string, any>)) {
    if (valObj.stringValue !== undefined) fields[key] = valObj.stringValue;
    else if (valObj.integerValue !== undefined) fields[key] = Number(valObj.integerValue);
    else if (valObj.doubleValue !== undefined) fields[key] = Number(valObj.doubleValue);
    else if (valObj.booleanValue !== undefined) fields[key] = valObj.booleanValue;
    else if (valObj.arrayValue !== undefined) {
      fields[key] = (valObj.arrayValue.values || []).map((v: any) =>
        v.stringValue !== undefined ? v.stringValue : parseFirestoreDoc({ fields: v.mapValue?.fields })
      );
    } else if (valObj.mapValue !== undefined) {
      fields[key] = parseFirestoreDoc({ fields: valObj.mapValue.fields });
    }
  }

  return { id, ...fields };
}

function encodeFirestoreFields(obj: Record<string, any>) {
  const fields: Record<string, any> = {};

  for (const [key, val] of Object.entries(obj)) {
    if (val === undefined || val === null) continue;
    if (typeof val === "string") fields[key] = { stringValue: val };
    else if (typeof val === "number") fields[key] = { doubleValue: val };
    else if (typeof val === "boolean") fields[key] = { booleanValue: val };
    else if (Array.isArray(val)) {
      fields[key] = {
        arrayValue: {
          values: val.map((item) => {
            if (typeof item === "string") return { stringValue: item };
            if (typeof item === "number") return { doubleValue: item };
            if (typeof item === "boolean") return { booleanValue: item };
            if (typeof item === "object") return { mapValue: { fields: encodeFirestoreFields(item) } };
            return { stringValue: String(item) };
          }),
        },
      };
    } else if (typeof val === "object") {
      fields[key] = { mapValue: { fields: encodeFirestoreFields(val) } };
    }
  }

  return fields;
}

// GET /api/gomla/categories -> List all categories with strict deduplication
export async function GET() {
  try {
    const url = `${BASE_URL}/gomla_categories?key=${API_KEY}`;
    const res = await fetch(url, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (data.documents && data.documents.length > 0) {
        const fetched = data.documents.map(parseFirestoreDoc).filter(Boolean);
        const map = new Map<string, any>();
        fetched.forEach((c: any) => {
          const key = (c.slug || c.nameAr || c.name || c.id).toLowerCase().trim();
          map.set(key, c);
        });
        globalCategoriesCache.forEach((c: any) => {
          const key = (c.slug || c.nameAr || c.name || c.id).toLowerCase().trim();
          if (!map.has(key)) map.set(key, c);
        });
        globalCategoriesCache = Array.from(map.values());
      }
    }
  } catch (err) {
    console.warn("Firestore GET categories fetch notice:", err);
  }

  // Deduplicate cache
  const dedupMap = new Map<string, any>();
  globalCategoriesCache.forEach((c: any) => {
    const key = (c.slug || c.nameAr || c.name || c.id).toLowerCase().trim();
    dedupMap.set(key, c);
  });

  return NextResponse.json({ categories: Array.from(dedupMap.values()) });
}

// POST /api/gomla/categories -> Create or Update Category
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, ...data } = body;

    const catId = id || "cat_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7);
    const categoryItem = {
      id: catId,
      name: data.name || "",
      nameAr: data.nameAr || "",
      slug: data.slug || "",
      description: data.description || "",
      image: data.image || "",
      order: data.order || 0,
      createdAt: new Date().toISOString(),
    };

    // Deduplicated update in memory cache
    const catKey = (categoryItem.slug || categoryItem.nameAr || categoryItem.name).toLowerCase().trim();
    const existingIndex = globalCategoriesCache.findIndex(
      (c) => (c.slug || c.nameAr || c.name).toLowerCase().trim() === catKey || c.id === catId
    );

    if (existingIndex >= 0) {
      globalCategoriesCache[existingIndex] = { ...globalCategoriesCache[existingIndex], ...categoryItem };
    } else {
      globalCategoriesCache.push(categoryItem);
    }

    // Attempt Firestore sync
    try {
      const fields = encodeFirestoreFields(categoryItem);
      const url = id ? `${BASE_URL}/gomla_categories/${id}?key=${API_KEY}` : `${BASE_URL}/gomla_categories?key=${API_KEY}`;
      await fetch(url, {
        method: id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fields }),
      });
    } catch {}

    return NextResponse.json({ category: categoryItem });
  } catch (error: any) {
    console.error("POST /api/gomla/categories error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/gomla/categories
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (id) {
      globalCategoriesCache = globalCategoriesCache.filter((c) => c.id !== id);
      try {
        const url = `${BASE_URL}/gomla_categories/${id}?key=${API_KEY}`;
        await fetch(url, { method: "DELETE" });
      } catch {}
    }

    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
