import OutboundAppCard, { type OutboundAppCardProps } from './OutboundAppCard';

interface OutboundPageProps {
  applications: OutboundAppCardProps[];
}

export default function OutboundPage({ applications }: OutboundPageProps) {
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
