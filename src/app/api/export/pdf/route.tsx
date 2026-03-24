import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { consumeExport } from "@/lib/db/usage";
import { getResumeForUser } from "@/lib/db/resumes";
import { ResumeDocument } from "@/lib/pdf/ResumeDocument";
import { renderToStream } from "@react-pdf/renderer";
import type { ResumeTemplateKey } from "@/lib/db/resumeTypes";

export const runtime = "nodejs";

async function streamToBuffer(stream: AsyncIterable<Uint8Array | string>) {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

export async function POST(req: Request) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "You must be logged in to export PDFs." },
      { status: 401 }
    );
  }

  const raw = await req.text();
  const body = raw?.trim()
    ? (JSON.parse(raw) as { resumeId?: string })
    : ({} as { resumeId?: string });
  if (!body.resumeId) {
    return NextResponse.json({ error: "Missing resumeId" }, { status: 400 });
  }

  // Enforce tier limits on the server before doing any heavy work.
  await consumeExport(user.id);

  const resumeRow = await getResumeForUser(user.id, body.resumeId);
  const template = resumeRow.template as ResumeTemplateKey;
  const pdfStream = await renderToStream(
    <ResumeDocument
      resume={resumeRow.content}
      template={template}
    />
  );
  const pdfBuffer = await streamToBuffer(
    pdfStream as unknown as AsyncIterable<Uint8Array | string>
  );

  return new NextResponse(new Uint8Array(pdfBuffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${
        resumeRow.title ?? "resume"
      }.pdf"`,
    },
  });
}

