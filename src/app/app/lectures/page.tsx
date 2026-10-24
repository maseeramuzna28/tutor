import PageHeader from "@/components/ui/PageHeader";

export default function LecturesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Shared · Planned"
        title="Live lectures and *recaps.*"
        lead="This feature is planned. It is not available yet."
      />
      <div className="app-body">
        <div className="planned-box">
          <h2 className="section-title">What is planned</h2>
          <p>
            Scheduled live lectures that run inside TUTO, with an AI generated recap
            video for anyone who missed the session.
          </p>
          <p className="meta">
            Nothing on this page is functional yet. It will be built once the live
            lecture and video services are chosen.
          </p>
        </div>
      </div>
    </>
  );
}
