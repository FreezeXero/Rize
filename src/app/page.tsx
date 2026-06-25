import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { PublicLandingPage } from "@/components/landing/PublicLandingPage";
import { FooterSection } from "@/components/landing/FooterSection";

export default async function Home() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  return (
    <>
      <PublicLandingPage />
      <FooterSection variant="full" />
    </>
  );
}
