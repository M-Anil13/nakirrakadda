import { NextResponse } from "next/server";
import { getCategories, addCategory, updateCategory, deleteCategory } from "@/lib/products-db";

export async function GET() {
  try {
    const cats = getCategories();
    return NextResponse.json(cats);
  } catch (error) {
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.name) {
      return NextResponse.json({ error: "Category name is required" }, { status: 400 });
    }
    const success = addCategory(body.name);
    if (!success) {
      return NextResponse.json({ error: "Category already exists or invalid" }, { status: 400 });
    }
    return NextResponse.json({ success: true, categories: getCategories() });
  } catch (error) {
    return NextResponse.json({ error: "Failed to add category" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    if (!body.oldName || !body.newName) {
      return NextResponse.json({ error: "oldName and newName are required" }, { status: 400 });
    }
    const success = updateCategory(body.oldName, body.newName);
    return NextResponse.json({ success, categories: getCategories() });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get("name");
    if (!name) {
      return NextResponse.json({ error: "Category name query param required" }, { status: 400 });
    }
    const success = deleteCategory(name);
    return NextResponse.json({ success, categories: getCategories() });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
  }
}
