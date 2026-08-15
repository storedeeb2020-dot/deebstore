import { NextResponse } from "next/server";

const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "deebstore-c8bfa";
const API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyAGbFTxHQuEqb9X8XN4OMhARbzoD3yvxX4";
const BASE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

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
        v.stringValue !== undefined
          ? v.stringValue
          : v.mapValue
          ? parseFirestoreDoc({ fields: v.mapValue.fields })
          : v
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

// GET /api/gomla/products -> List all products
export async function GET() {
  try {
    const url = `${BASE_URL}/gomla_products?key=${API_KEY}`;
    const res = await fetch(url, { cache: "no-store" });
    const data = await res.json();

    if (!data.documents) {
      return NextResponse.json({ products: [] });
    }

    const products = data.documents.map(parseFirestoreDoc).filter(Boolean);
    return NextResponse.json({ products });
  } catch (error: any) {
    console.error("GET /api/gomla/products error:", error);
    return NextResponse.json({ products: [], error: error.message }, { status: 500 });
  }
}

// POST /api/gomla/products -> Create or update product
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, ...rest } = body;

    const fields = encodeFirestoreFields({
      ...rest,
      updatedAt: new Date().toISOString(),
    });

    if (id) {
      // Update existing document via PATCH
      const url = `${BASE_URL}/gomla_products/${id}?key=${API_KEY}`;
      const res = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fields }),
      });
      const data = await res.json();
      const updated = parseFirestoreDoc(data);
      return NextResponse.json({ product: updated || { id, ...rest } });
    } else {
      // Create new document via POST
      const url = `${BASE_URL}/gomla_products?key=${API_KEY}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fields: {
            ...fields,
            createdAt: { stringValue: new Date().toISOString() },
          },
        }),
      });
      const data = await res.json();
      const created = parseFirestoreDoc(data);
      return NextResponse.json({ product: created });
    }
  } catch (error: any) {
    console.error("POST /api/gomla/products error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/gomla/products -> Delete product by id
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing id parameter" }, { status: 400 });
    }

    const url = `${BASE_URL}/gomla_products/${id}?key=${API_KEY}`;
    await fetch(url, { method: "DELETE" });

    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    console.error("DELETE /api/gomla/products error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
