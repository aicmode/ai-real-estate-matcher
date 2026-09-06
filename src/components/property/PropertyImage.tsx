"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";
import { PROPERTY_IMAGE_FALLBACK } from "@/lib/property-images";

/** Failure is scoped to the source, so changing properties retries the new image. */
export function PropertyImage({ src, alt, ...props }: ImageProps) {
  const [failedSource, setFailedSource] = useState<ImageProps["src"] | null>(null);
  const failed = failedSource === src;
  return (
    <Image
      {...props}
      src={failed ? PROPERTY_IMAGE_FALLBACK : src}
      alt={alt}
      onError={failed ? undefined : () => setFailedSource(src)}
    />
  );
}
