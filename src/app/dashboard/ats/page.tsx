import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { listResumes } from "@/lib/db/resumes";
import { ATSChecker } from "@/components/ats/ATSChecker";

export default async function ATSPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const resumes = await listResumes(user.id);
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">
      <h1 className="text-2xl font-semibold text-white">ATS Checker</h1>
      <p className="mt-2 text-zinc-300">
        Match keywords and get suggestions for your next rewrite.
      </p>
      <div className="mt-8">
        <ATSChecker
          resumes={resumes.map((r) => ({ id: r.id, title: r.title }))}
        />
      </div>
    </div>
  );
}

