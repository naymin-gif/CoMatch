import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { GoDotFill } from 'react-icons/go';

interface ChatPreviewCardProps {
  name: string;
  profile_pic_url?: string;
  message: string;
  time: string;
  hasUnread: boolean;
}

export default function ChatPreviewCard({
  name,
  profile_pic_url,
  message,
  time,
  hasUnread,
}: ChatPreviewCardProps) {
  return (
    <Card className="p-2 bg-comatch-background">
      <CardContent className="flex flex-row gap-3">
        <Avatar>
          <AvatarImage src={profile_pic_url} alt="Profile Picture" />
          <AvatarFallback />
        </Avatar>

        <div className="flex flex-col gap-3 w-full">
          {/* Name and Unread  */}
          <div className="flex flex-row items-center justify-between">
            <span className="font-heading">{name}</span>
            <span className="text-gray-500">{time}</span>
          </div>

          {/* Last Message and Time  */}
          <div className="flex flex-row items-center justify-between">
            <span className="text-gray-500">{message}</span>
            {hasUnread && <GoDotFill className="text-red-500" />}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
