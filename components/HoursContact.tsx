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
    <section className="px-6 pb-16">
      <div className="mx-auto grid max-w-3xl gap-6 md:grid-cols-2">
        <div className="border border-hairline px-8 py-10 text-center">
          <h3 className="font-script text-3xl text-bronze">Hours</h3>
          <ul className="mt-6 space-y-4">
            {hours.map((row) => (
              <li key={row.label}>
                <p className="font-display text-sm uppercase tracking-widest2">{row.label}</p>
                <p className="text-xs uppercase tracking-widest text-ink/60">{row.time}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="border border-hairline px-8 py-10 text-center">
          <h3 className="font-script text-3xl text-bronze">Contact</h3>
          <ul className="mt-6 space-y-4 text-left inline-flex flex-col mx-auto">
            {contact.map((row) => {
              const Icon = contactIcons[row.icon];
              return (
                <li key={row.label} className="flex items-center gap-3">
                  <Icon />
                  <a
                    href={row.href}
                    className="text-sm tracking-wide text-ink/85 hover:text-bronze transition-colors"
                  >
                    {row.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
