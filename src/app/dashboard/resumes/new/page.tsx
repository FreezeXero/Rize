import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { getUserPlan } from "@/lib/db/usage";
import { RESUME_TEMPLATES } from "@/lib/templates/resumeTemplates";
import { TemplatePicker } from "@/components/dashboard/TemplatePicker";

export default async function NewResumePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const plan = await getUserPlan(user.id);

  return <TemplatePicker plan={plan} templates={RESUME_TEMPLATES} />;
}
