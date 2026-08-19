import Image from "next/image";

type StylistIntroProps = {
  name: string;
  bio: string;
  avatarInitials: string;
  avatarSrc?: string;
};

export default function StylistIntro({ name, bio, avatarInitials, avatarSrc }: StylistIntroProps) {
  return (
    <section className="px-6 pb-14">
      <div className="mx-auto max-w-2xl border border-hairline px-6 py-10 md:px-10">
        <h2 className="text-center font-display text-2xl md:text-3xl">
          Meet <span className="font-script text-4xl md:text-5xl align-middle text-bronze">{name}</span>
        </h2>

        <div className="mt-8 flex flex-col-reverse md:flex-row items-center gap-8">
          <p className="text-center md:text-left text-[1.05rem] leading-relaxed text-ink/85">
            {bio}
          </p>

          {avatarSrc ? (
            <Image
              src={avatarSrc}
              alt={name}
              width={112}
              height={112}
              className="h-28 w-28 shrink-0 rounded-full border border-hairline object-cover"
            />
          ) : (
            <div
              aria-hidden
              className="flex h-28 w-28 shrink-0 items-center justify-center rounded-full border border-hairline bg-ink/5 font-display text-3xl text-bronze"
            >
              {avatarInitials}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
