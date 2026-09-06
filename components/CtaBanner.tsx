type CtaBannerProps = {
  label: string;
  href: string;
};

export default function CtaBanner({ label, href }: CtaBannerProps) {
  return (
    <section className="px-6 pb-20">
      <a
        href={href}
        className="mx-auto flex max-w-3xl items-center justify-center bg-ink py-6 text-sm tracking-[0.3em] uppercase text-cream transition-opacity hover:opacity-90"
      >
        {label}
      </a>
    </section>
  );
}
