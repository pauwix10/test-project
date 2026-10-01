import { FormEvent, ReactNode, useState } from "react";
import { trackFormSubmit } from "./analytics";
import { SITE } from "./site";

/* ============================================================================
   Lead form, shared by all four tracks. Netlify Forms.

   Fields are the children, so each track owns its own questions; this file
   only owns submission, attribution and the conversion signal.

   Netlify only accepts a submission for a form it found at BUILD time, and it
   finds forms by parsing static HTML - it cannot see this React form. So every
   track shell (<track>/index.html) carries a hidden stub with the same `name`
   and EVERY field name used here, including gclid / campaignid / referrer /
   bot-field. Add a field in a page file and you must add it to that stub, or
   Netlify silently drops the value.

   Submissions do not work under `npm run dev` (Vite has no "/" POST handler);
   test on a deploy preview or with `netlify dev`.
   ========================================================================== */

type LeadFormProps = {
  /** Netlify form name. Must match the stub in the track shell. */
  name: string;
  /** GA4 `form` param sent with lead_form_submit. */
  event: string;
  submitLabel: string;
  /** Rendered in place of the form once it has sent. */
  sent: ReactNode;
  foot?: ReactNode;
  children: ReactNode;
};

function attribution(): Record<string, string> {
  const q = new URLSearchParams(window.location.search);
  const out: Record<string, string> = {};
  const gclid = q.get("gclid");
  if (gclid) out.gclid = gclid;
  const campaign = q.get("campaignid") || q.get("utm_campaign");
  if (campaign) out.campaignid = campaign;
  if (document.referrer) out.referrer = document.referrer;
  return out;
}

export function LeadForm({ name, event, submitLabel, sent, foot, children }: LeadFormProps) {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    for (const [k, v] of Object.entries(attribution())) data.set(k, v);
    const body = new URLSearchParams();
    data.forEach((v, k) => body.append(k, typeof v === "string" ? v : v.name));

    setState("sending");
    try {
      const res = await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
      });
      if (!res.ok) throw new Error(String(res.status));
      trackFormSubmit(event);
      setState("sent");
    } catch {
      setState("error");
    }
  }

  if (state === "sent") {
    return <div className="sent" role="status">{sent}</div>;
  }

  return (
    <form name={name} method="POST" data-netlify="true" netlify-honeypot="bot-field" className="form" onSubmit={onSubmit}>
      <input type="hidden" name="form-name" value={name} />
      <p className="hp" aria-hidden="true">
        <label>Leave this empty <input name="bot-field" tabIndex={-1} autoComplete="off" /></label>
      </p>
      {children}
      <button type="submit" className="form__submit" disabled={state === "sending"}>
        {state === "sending" ? "Sending…" : submitLabel}
      </button>
      {state === "error" && (
        <p className="form__error" role="alert">
          That did not send. Please try again, or call <a href={SITE.phoneHref}>{SITE.phone}</a>.
        </p>
      )}
      {foot && <p className="form__foot">{foot}</p>}
    </form>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="field">
      {label}
      {children}
    </label>
  );
}
