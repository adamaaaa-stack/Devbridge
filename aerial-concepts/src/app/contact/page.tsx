import { STORE } from '@/lib/catalog';

export const metadata = {
  title: 'Contact',
};

export default function ContactPage() {
  return (
    <div className="section-pad">
      <div className="container-page grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        <div>
          <p className="eyebrow">Get in touch</p>
          <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            Contact
          </h1>
          <p className="mt-3 text-ink-500">
            Call, email or visit the Kelvin showroom. We&apos;re happy to help with builds, stock
            and shipping.
          </p>

          <dl className="mt-8 space-y-5 text-sm">
            <div>
              <dt className="font-mono text-[10px] uppercase tracking-wider text-ink-400">Phone</dt>
              <dd className="mt-1">
                <a
                  href={`tel:${STORE.phone.replace(/\s/g, '')}`}
                  className="text-lg font-semibold text-ink hover:text-flame"
                >
                  {STORE.phone}
                </a>
              </dd>
            </div>
            <div>
              <dt className="font-mono text-[10px] uppercase tracking-wider text-ink-400">Email</dt>
              <dd className="mt-1">
                <a href={`mailto:${STORE.email}`} className="font-medium hover:text-flame">
                  {STORE.email}
                </a>
              </dd>
            </div>
            <div>
              <dt className="font-mono text-[10px] uppercase tracking-wider text-ink-400">Address</dt>
              <dd className="mt-1 max-w-xs leading-relaxed">{STORE.address}</dd>
            </div>
            <div>
              <dt className="font-mono text-[10px] uppercase tracking-wider text-ink-400">Hours</dt>
              <dd className="mt-2 space-y-1.5">
                {STORE.hours.map((h) => (
                  <p key={h.day} className="flex justify-between gap-6">
                    <span>{h.day}</span>
                    <span className="font-mono text-ink-400">{h.time}</span>
                  </p>
                ))}
              </dd>
            </div>
          </dl>
        </div>

        <div className="rounded-2xl border border-ink/10 bg-white p-6 shadow-card sm:p-8">
          <h2 className="font-display text-2xl font-semibold">Send a message</h2>
          <p className="mt-2 text-sm text-ink-500">
            Demo form — messages aren&apos;t sent. Use phone or email for real enquiries.
          </p>
          <form className="mt-6 grid gap-4" action="#" method="get">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Name" name="name" autoComplete="name" />
              <Field label="Email" name="email" type="email" autoComplete="email" />
            </div>
            <Field label="Phone" name="phone" type="tel" autoComplete="tel" />
            <label className="grid gap-1.5 text-sm">
              <span className="font-medium">Message</span>
              <textarea
                name="message"
                rows={5}
                className="rounded-lg border border-ink/15 px-3 py-2.5 focus:border-flame focus:outline-none focus:ring-2 focus:ring-flame/30"
                placeholder="What are you looking for?"
              />
            </label>
            <button type="button" className="btn-primary justify-self-start">
              Send message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  name,
  type = 'text',
  autoComplete,
}: {
  label: string;
  name: string;
  type?: string;
  autoComplete?: string;
}) {
  return (
    <label className="grid gap-1.5 text-sm">
      <span className="font-medium">{label}</span>
      <input
        name={name}
        type={type}
        autoComplete={autoComplete}
        className="rounded-lg border border-ink/15 px-3 py-2.5 focus:border-flame focus:outline-none focus:ring-2 focus:ring-flame/30"
      />
    </label>
  );
}
