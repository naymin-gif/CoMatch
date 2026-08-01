import OutboundAppCard, { type OutboundAppCardProps } from './OutboundAppCard';
import { TbFileSad } from "react-icons/tb";

interface OutboundPageProps {
  applications: OutboundAppCardProps[];
}

export default function OutboundPage({ applications }: OutboundPageProps) {
  
  if (applications.length === 0) {
    return (
      <div className='flex flex-row gap-3 items-center justify-center'>
        <TbFileSad className='text-xl'/>
        <span>
          You do not have any outbound applications. <br />
          Applications will appear here when you apply to join other teams.
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-3">
      {applications.map((cardProps) => (
        <OutboundAppCard
          key={`${cardProps.postId}-${cardProps.ownerId}`}
          {...cardProps}
        />
      ))}
    </div>
  );
}
