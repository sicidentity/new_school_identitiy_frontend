import * as React from "react";
import Image from "next/image";

interface AvatarProps {
  src?: string;
  alt?: string;
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Avatar({
  src,
  alt,
  name,
  size = "md",
  className = "",
}: AvatarProps) {
  const [imgError, setImgError] = React.useState(false);

  // Determine size class based on prop
  const sizeClass = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-10 w-10",
  }[size];

  // Get initials from name
  const getInitials = () => {
    if (!name) return "?";
    const nameParts = name.split(" ");
    if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase();
    return (
      nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)
    ).toUpperCase();
  };

  // Display image if available, otherwise show initials
  return (
    <div
      className={`${sizeClass} rounded-full overflow-hidden bg-gray-100 flex-shrink-0 ${className}`}
    >
      {imgError || !src ? (
        <div className="h-full w-full flex items-center justify-center bg-blue-100 text-blue-600 font-medium">
          {getInitials()}
        </div>
      ) : (
        <Image
          src={src as string} // Type assertion to string
          alt={alt || `${name}'s avatar`}
          className="h-full w-full object-cover"
          onError={() => setImgError(true)}
          width={100} // Adjust width as needed
          height={100} // Adjust height as needed
        />
      )}
    </div>
  );
}
