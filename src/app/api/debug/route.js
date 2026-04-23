import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
  const diagnostics = {
    timestamp: new Date().toISOString(),
    env: {
      DATABASE_URL: process.env.DATABASE_URL ? "SET (" + process.env.DATABASE_URL.substring(0, 20) + "...)" : "NOT SET",
      POSTGRES_URL: process.env.POSTGRES_URL ? "SET (" + process.env.POSTGRES_URL.substring(0, 20) + "...)" : "NOT SET",
      NODE_ENV: process.env.NODE_ENV,
      NEXT_PHASE: process.env.NEXT_PHASE || "none",
    },
    fs: {},
    tests: {}
  };

  // Test 0: List API files
  try {
    const fs = await import("fs");
    const path = await import("path");
    const apiDir = path.join(process.cwd(), "src", "app", "api");
    if (fs.existsSync(apiDir)) {
      diagnostics.fs.apiDir = fs.readdirSync(apiDir, { recursive: true });
    } else {
      diagnostics.fs.apiDir = "NOT_FOUND: " + apiDir;
    }
  } catch (err) {
    diagnostics.fs.apiDir = "ERROR: " + err.message;
  }

  // Test 1: Can we import prisma?
  try {
    const prismaModule = await import("@/lib/prisma");
    diagnostics.tests.prismaImport = "OK";
    
    // Test 2: Can we query?
    try {
      const count = await prismaModule.getPrisma().chofer.count();
      diagnostics.tests.choferCount = count;
      diagnostics.tests.dbConnection = "OK";
    } catch (dbErr) {
      diagnostics.tests.dbConnection = "FAIL: " + dbErr.message;
    }
  } catch (importErr) {
    diagnostics.tests.prismaImport = "FAIL: " + importErr.message;
  }

  // Test 3: Can we import actions?
  try {
    const actions = await import("@/lib/appActions");
    diagnostics.tests.actionsImport = "OK";
    diagnostics.tests.availableExports = Object.keys(actions).sort();

    // Test 4: Run getAllChoferes
    try {
      const res = await actions.getAllChoferes();
      diagnostics.tests.getAllChoferes = res.success ? `OK (${res.data?.length} choferes)` : `FAIL: ${res.error}`;
    } catch (err) {
      diagnostics.tests.getAllChoferes = "THROW: " + err.message;
    }
  } catch (importErr) {
    diagnostics.tests.actionsImport = "FAIL: " + importErr.message;
  }

  // Test 5: Can we import cookies?
  try {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    diagnostics.tests.cookies = "OK";
  } catch (err) {
    diagnostics.tests.cookies = "FAIL: " + err.message;
  }

  return NextResponse.json(diagnostics, { status: 200 });
}
