import React from "react";

function MissingConfigMessage() {
  return (
    <p className="text-sm text-zinc-500">
      Contact form is not configured. Set{" "}
      <code className="rounded bg-white/5 px-1 py-0.5 text-zinc-300">
        FORMSPREE_CONTACT_FORM_ID
      </code>{" "}
      in your environment.
    </p>
  );
}

/**
 * Formspree-backed contact form. Never throws during SSR — if the env var is
 * missing, shows a placeholder so pages like /help don’t 500 in dev or prod.
 */
export function ContactForm() {
  const id = process.env.FORMSPREE_CONTACT_FORM_ID;
  if (!id) {
    return <MissingConfigMessage />;
  }

  return (
    <form
      action={`https://formspree.io/f/${id}`}
      method="POST"
      className="grid gap-4 rounded-3xl border border-white/10 bg-white/5 p-6"
    >
      <div className="grid gap-2 md:grid-cols-2">
        <label className="grid gap-1">
          <span className="text-sm text-zinc-300">Name</span>
          <input
            name="name"
            required
            className="h-11 rounded-xl border border-white/10 bg-black/20 px-4 text-sm text-white placeholder:text-zinc-500 outline-none focus:border-cyan-300/50"
            placeholder="Your name"
          />
        </label>
        <label className="grid gap-1">
          <span className="text-sm text-zinc-300">Email</span>
          <input
            name="email"
            type="email"
            required
            className="h-11 rounded-xl border border-white/10 bg-black/20 px-4 text-sm text-white placeholder:text-zinc-500 outline-none focus:border-cyan-300/50"
            placeholder="you@example.com"
          />
        </label>
      </div>

      <label className="grid gap-1">
        <span className="text-sm text-zinc-300">Message</span>
        <textarea
          name="message"
          required
          rows={5}
          className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white placeholder:text-zinc-500 outline-none focus:border-cyan-300/50"
          placeholder="Tell us what you're looking for..."
        />
      </label>

      <button
        type="submit"
        className="inline-flex h-11 items-center justify-center rounded-xl bg-gradient-to-r from-cyan-300/30 to-violet-300/30 px-5 text-sm font-semibold text-white ring-1 ring-white/10 transition hover:brightness-110"
      >
        Send message
      </button>
      <p className="text-xs text-zinc-500">
        By sending this form, you agree to be contacted about your request.
      </p>
    </form>
  );
}
