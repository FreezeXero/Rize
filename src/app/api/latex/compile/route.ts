import { NextResponse } from "next/server";

export const runtime = "nodejs";

type LatexCompileBody = {
  latexSource?: string;
};

function decodeBase64Pdf(base64: string) {
  const clean = base64.replace(/^data:application\/pdf;base64,/, "");
  const buf = Buffer.from(clean, "base64");
  return new Uint8Array(buf);
}

export async function POST(req: Request) {
  const body = (await req.json()) as LatexCompileBody;
  const latexSource = body?.latexSource?.trim();
  if (!latexSource) {
    return NextResponse.json({ error: "Missing latexSource" }, { status: 400 });
  }

  const compileUrl = process.env.LATEX_COMPILE_URL ?? "https://latex.ytotech.com/builds/sync";

  const payload = {
    compiler: "pdflatex",
    resources: [
      {
        main: true,
        content: latexSource,
      },
    ],
  };

  const res = await fetch(compileUrl, {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/pdf, application/json" },
    body: JSON.stringify(payload),
  });

  const contentType = res.headers.get("content-type") ?? "";

  if (res.ok && contentType.includes("application/pdf")) {
    const bytes = new Uint8Array(await res.arrayBuffer());
    return new NextResponse(bytes, {
      status: 200,
      headers: {
        "content-type": "application/pdf",
        "cache-control": "no-store",
      },
    });
  }

  const text = await res.text().catch(() => "");
  let json: unknown = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }

  const maybeBase64 =
    (json as { pdf?: string } | null)?.pdf ??
    (json as { result?: { pdf?: string; data?: string } } | null)?.result?.pdf ??
    (json as { result?: { pdf?: string; data?: string } } | null)?.result?.data ??
    null;

  if (typeof maybeBase64 === "string" && maybeBase64.length > 80) {
    const bytes = decodeBase64Pdf(maybeBase64);
    return new NextResponse(bytes, {
      status: 200,
      headers: {
        "content-type": "application/pdf",
        "cache-control": "no-store",
      },
    });
  }

  return NextResponse.json(
    {
      error:
        `LaTeX compilation failed (${res.status}). ` +
        (typeof text === "string" && text.length < 500 ? text : "Unexpected compiler response."),
    },
    { status: 502 }
  );
}
