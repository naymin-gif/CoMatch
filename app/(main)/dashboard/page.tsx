"use client";

import InboundAppCard, { InboundAppCardProps } from "@/components/dashboard/InboundAppCard";
import OutboundAppCard, { OutboundAppCardProps} from "@/components/dashboard/OutboundAppCard";

// MOCK DATA
const application: InboundAppCardProps = {
  postTitle: "Many Engineers Needed",
  applicantId: "123",
  applicantName: "Win Htut Khaung Soe",
  appliedRole:"Prompt Engineer",
  message: "I love you so much",
  postId: "1",
  onApprove: () => {},
  onReject: () => {},
}

const outapp: OutboundAppCardProps = {
  postTitle: "Many Engineers Needed",
  ownerId: "123",
  ownerName: "Nay Min Thar",
  appliedRole:"Prompt Engineer",
  message: "I love you so much",
  postId: "1",
  result: true,
}

export default function DashboardPage() {
  return (
    <div className="p-10 flex flex-col gap-5">
      <InboundAppCard 
        postTitle = {application.postTitle}
        applicantId = {application.applicantId}
        applicantName = {application.applicantName}
        appliedRole = {application.appliedRole}
        message = {application.message}
        postId = {application.postId}
        onApprove = {application.onApprove}
        onReject = {application.onReject}
      />

      <OutboundAppCard 
        postTitle={outapp.postTitle}
        ownerId={outapp.ownerId}
        ownerName={outapp.ownerName}
        appliedRole={outapp.appliedRole}
        message={outapp.message}
        postId={outapp.postId}
        result={outapp.result}
      />
    </div>
  )
}