"use client";

import InboundAppCard, { type InboundAppCardProps } from "./InboundAppCard";
import OutboundAppCard, { type OutboundAppCardProps } from "./OutboundAppCard";

export interface OldApplicationsPageProps {
  inboundCardProps: InboundAppCardProps[];
  outboundCardProps: OutboundAppCardProps[];
}

export default function OldApplicationsPage({
  inboundCardProps,
  outboundCardProps,
}: OldApplicationsPageProps) {
  return (
    <div className="flex flex-wrap gap-3">
      {inboundCardProps.map((cardProps, index) => (
        <InboundAppCard
          key={`inbound-${cardProps.postId}-${cardProps.applicantId}-${index}`}
          {...cardProps}
        />
      ))}

      {outboundCardProps.map((cardProps, index) => (
        <OutboundAppCard
          key={`outbound-${cardProps.postId}-${cardProps.ownerId}-${index}`}
          {...cardProps}
        />
      ))}
    </div>
  );
}