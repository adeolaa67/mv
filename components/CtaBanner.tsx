type CtaBannerProps = {
  label: string;
  href: string;
};

export default function CtaBanner({ label, href }: CtaBannerProps) {
  return (
    <section className="px-6 pb-16">
      <a
        href={href}
        className="mx-auto flex max-w-2xl items-center justify-center bg-ink py-4 text-xs tracking-[0.3em] uppercase text-cream transition-opacity hover:opacity-90"
      >
        {label}
      </a>
    </section>
  );
}
