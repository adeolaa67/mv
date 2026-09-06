import { HoursRow, ContactRow } from "@/lib/types";
import { InstagramIcon, TikTokIcon, MailIcon, PhoneIcon } from "./icons";

const contactIcons = {
  instagram: InstagramIcon,
  tiktok: TikTokIcon,
  mail: MailIcon,
  phone: PhoneIcon,
};

type HoursContactProps = {
  hours: HoursRow[];
  contact: ContactRow[];
};

export default function HoursContact({ hours, contact }: HoursContactProps) {
  return (
    <section className="px-6 pb-20">
      <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-2">
        <div className="card-alive border border-hairline px-10 py-12 text-center">
          <h3 className="font-script text-4xl text-bronze">Hours</h3>
          <ul className="mt-8 space-y-5">
            {hours.map((row) => (
              <li key={row.label}>
                <p className="font-display text-base uppercase tracking-widest2">{row.label}</p>
                <p className="text-sm uppercase tracking-widest text-ink/60">{row.time}</p>
              </li>
            ))}
          </ul>
          <span aria-hidden className="card-alive-bar" />
        </div>

        <div className="card-alive border border-hairline px-10 py-12 text-center">
          <h3 className="font-script text-4xl text-bronze">Contact</h3>
          <ul className="mt-8 space-y-5 text-left inline-flex flex-col mx-auto">
            {contact.map((row) => {
              const Icon = contactIcons[row.icon];
              return (
                <li key={row.label} className="flex items-center gap-3">
                  <Icon className="icon-float" width={20} height={20} />
                  <a
                    href={row.href}
                    className="text-base tracking-wide text-ink/85 hover:text-bronze transition-colors"
                  >
                    {row.label}
                  </a>
                </li>
              );
            })}
          </ul>
          <span aria-hidden className="card-alive-bar" />
        </div>
      </div>
    </section>
  );
}
