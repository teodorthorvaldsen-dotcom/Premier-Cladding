import Image from "next/image";

const OUR_WORK_IMAGES = [
  "/images/our-work/our-work-1.png",
  "/images/our-work/our-work-2.png",
  "/images/our-work/our-work-3.png",
  "/images/our-work/our-work-4.png",
  "/images/our-work/our-work-5.png",
  "/images/our-work/our-work-6.png",
  "/images/our-work/our-work-7.png",
  "/images/our-work/our-work-8.png",
  "/images/our-work/our-work-9.png",
  "/images/our-work/our-work-10.png",
];

export default function OurWorkPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <h1 className="sr-only">Our Work</h1>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:gap-8">
        {OUR_WORK_IMAGES.map((src) => (
          <div
            key={src}
            className="relative aspect-[4/3] min-h-[280px] overflow-hidden rounded-xl bg-gray-200 sm:min-h-[320px]"
          >
            <Image
              src={src}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 640px"
              quality={100}
              unoptimized
            />
          </div>
        ))}
      </div>
    </div>
  );
}
