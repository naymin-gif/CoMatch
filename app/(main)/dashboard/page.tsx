import ApplicationCard, { ApplicationCardProps } from "@/components/dashboard/ApplicationCard";

// MOCK DATA
const application: ApplicationCardProps = {
  postTitle: "Many Engineers Needed",
  applicantId: "123",
  applicantName: "Win Htut Khaung Soe",
  appliedRole:"Prompt Engineer",
  message: "I love you so much",
  postId: "1",
  onApprove: () => {},
  onReject: () => {},
}
export default function DashboardPage() {
  return (
    <div className="p-10">
      <ApplicationCard 
        postTitle = {application.postTitle}
        applicantId = {application.applicantId}
        applicantName = {application.applicantName}
        appliedRole = {application.appliedRole}
        message = {application.message}
        postId = {application.postId}
        onApprove = {application.onApprove}
        onReject = {application.onReject}
      />
    </div>
  )
}