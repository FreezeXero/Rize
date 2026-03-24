import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { getResumeForUser } from "@/lib/db/resumes";
import { getUserPlan } from "@/lib/db/usage";
import { ResumeEditor } from "@/components/resume/ResumeEditor";
import type { ResumeTemplateKey } from "@/lib/db/resumeTypes";

export default async function EditResumePage({
  params,
}: {
  params: { id: string };
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const resume = await getResumeForUser(user.id, params.id);
  const plan = await getUserPlan(user.id);

  return (
    <div className="w-full max-w-none px-0 py-0">
      <ResumeEditor
        userPlan={plan}
        resumeId={resume.id}
        initialResume={resume.content}
        initialTemplate={resume.template as unknown as ResumeTemplateKey}
        initialTitle={resume.title ?? "Untitled Resume"}
      />
    </div>
  );
}

