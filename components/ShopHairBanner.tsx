import Link from "next/link";
import Image from "next/image";

type ShopHairBannerProps = {
  imageUrl: string | null;
};

export default function ShopHairBanner({ imageUrl }: ShopHairBannerProps) {
  return (
    <section className="px-6 pb-16 text-center">
      <Link href="/shop" className="mx-auto block max-w-2xl">
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
    </section>
  );
}
