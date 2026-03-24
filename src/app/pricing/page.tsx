import { PricingPageClient } from "@/components/pricing/PricingPageClient";
import { ContactForm } from "@/components/forms/ContactForm";

export default function PricingPage() {
  return (
    <>
      <PricingPageClient />
      <section className="border-t border-white/5">
        <div className="mx-auto max-w-6xl px-4 py-16 md:px-6">
          <h2 className="text-xl font-semibold text-white md:text-2xl">
            Questions or want a custom plan? Send us a message.
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-zinc-400">
            This is separate from the FAQ — we&apos;ll get back to you by email.
          </p>
          <div className="mt-8">
            <ContactForm />
          </div>
        </div>
      </section>
    </>
  );
}

