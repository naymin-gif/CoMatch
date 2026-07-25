"use client";

import InboundAppCard, {
  type InboundAppCardProps,
} from "./InboundAppCard";

export interface InboundPageProps {
  inboundCardProps: InboundAppCardProps[];
}

export default function InboundPage({
  inboundCardProps,
}: InboundPageProps) {
  return (
    <div className="flex flex-wrap gap-3">
      {inboundCardProps.map((cardProps, index) => (
        <InboundAppCard
          key={index}
          {...cardProps}
        />
      ))}
    </div>
  );
}