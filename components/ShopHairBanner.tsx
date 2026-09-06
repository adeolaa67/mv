import Link from "next/link";
import Image from "next/image";

type ShopHairBannerProps = {
  imageUrl: string | null;
};

export default function ShopHairBanner({ imageUrl }: ShopHairBannerProps) {
  return (
    <section className="px-6 pb-16 text-center">
      <div className="mx-auto max-w-2xl">
        <Link href="/shop" className="block">
          <h2 className="font-script text-5xl text-bronze transition-opacity hover:opacity-80 md:text-6xl">
            Shop Ade&apos;s Hair
          </h2>
          {imageUrl && (
            <div className="mt-6 h-56 w-full overflow-hidden border border-hairline sm:h-72">
              <Image
                src={imageUrl}
                alt="Shop Ade's Hair"
                width={800}
                height={450}
                className="h-full w-full object-cover transition-transform hover:scale-105"
              />
            </div>
          )}
        </Link>
        <Link
          href="/shop"
          className="pop-click mt-4 flex items-center justify-center gap-2 bg-bronze py-4 text-xs font-semibold tracking-[0.3em] uppercase text-cream transition-opacity hover:opacity-90"
        >
          Click to Buy Hair →
        </Link>
      </div>
    </section>
  );
}
