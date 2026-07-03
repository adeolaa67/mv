import { PinIcon } from "./icons";

type SiteHeaderProps = {
  name: string;
  tagline: string;
  location: string;
};

export default function SiteHeader({ name, tagline, location }: SiteHeaderProps) {
  return (
    <header className="flex flex-col items-center gap-6 pt-16 pb-10 px-6 text-center">
      <div>
        <p className="font-display text-3xl md:text-4xl tracking-widest2 uppercase">
          {name}
        </p>
        <p className="mt-2 text-xs tracking-[0.4em] uppercase text-ink/70">
          {tagline}
        </p>
      </div>

      <div className="flex items-center gap-2 text-xs tracking-[0.25em] uppercase text-ink/80">
        <PinIcon />
        <span>{location}</span>
        <PinIcon />
      </div>
    </header>
  );
}
