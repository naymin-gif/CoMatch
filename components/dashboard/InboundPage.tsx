'use client';

import InboundAppCard, { type InboundAppCardProps } from './InboundAppCard';
import { TbFileSad } from "react-icons/tb";

export interface InboundPageProps {
  inboundCardProps: InboundAppCardProps[];
}

export default function InboundPage({ inboundCardProps }: InboundPageProps) {
  if (inboundCardProps.length === 0) {
    return (
      <div className='flex flex-row gap-3 items-center justify-center'>
        <TbFileSad className='text-xl'/>
        <span>
          You do not have any inbound applications to review. <br />
          Applications will appear here when other users apply your team.
        </span>
      </div>
    );
  }
  return (
    <div className="flex flex-wrap gap-3">
      {inboundCardProps.map((cardProps, index) => (
        <InboundAppCard key={index} {...cardProps} />
      ))}
    </div>
  );
}
