"use client"

interface GuideImagePageProps {
  imagePath: string
  altText: string
}

export function GuideImagePage({ imagePath, altText }: GuideImagePageProps) {
  return (
    <div className="min-h-dvh bg-white">
      <img
        src={imagePath}
        alt={altText}
        className="w-full h-auto"
      />
    </div>
  )
}
