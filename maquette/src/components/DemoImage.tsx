import Image from "next/image";
import manifest from "@/content/images.generated.json";

type Entry = { width: number; height: number; blurDataURL: string };

type Props = {
  file: string;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
  /** Fill the parent box (which must be positioned) instead of using intrinsic size. */
  fill?: boolean;
};

/** next/image with dimensions and blur placeholder from the generated manifest. */
export function DemoImage({ file, alt, sizes, priority, className, fill }: Props) {
  const entry = (manifest as Record<string, Entry>)[file];
  if (!entry) throw new Error(`Image absente du manifeste : ${file}`);
  const common = { src: `/images/${file}`, alt, sizes, priority, className, placeholder: "blur" as const, blurDataURL: entry.blurDataURL };
  return fill ? <Image {...common} fill /> : <Image {...common} width={entry.width} height={entry.height} />;
}
