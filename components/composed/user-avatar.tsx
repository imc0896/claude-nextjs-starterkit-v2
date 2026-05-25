import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface UserAvatarProps {
  name: string
  imageUrl?: string
  className?: string
}

/** 이니셜 폴백이 포함된 사용자 아바타 */
export function UserAvatar({ name, imageUrl, className }: UserAvatarProps) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <Avatar className={cn("size-8", className)}>
      {imageUrl && <AvatarImage src={imageUrl} alt={name} />}
      <AvatarFallback className="text-xs">{initials}</AvatarFallback>
    </Avatar>
  )
}
