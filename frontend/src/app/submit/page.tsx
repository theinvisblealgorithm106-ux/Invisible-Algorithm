// Replace with the real Google Form embed URL once the form is created
// (Form > Send > embed <> > copy the src, or append ?embedded=true to the form's viewform URL)
const GOOGLE_FORM_EMBED_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSeMW8v3SrQDQhL8ek82qgyfTRT85vnTv1QkIdsxrChm4p-3Tw/viewform?embedded=true';

export default function SubmitResearchPage() {
  return (
    <div className="pt-16 min-h-screen">
      <section className="section-sm relative">
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="container-page relative max-w-2xl">
          <p className="label mb-3">Submit</p>
          <h1 className="heading-xl mb-3">Submit Research</h1>
          <p className="text-text-secondary mb-10">
            Share your original research with The Invisible Algorithm community. Submissions are reviewed before publication.
          </p>

          <div className="card overflow-hidden p-0">
            <iframe
              src={GOOGLE_FORM_EMBED_URL}
              title="Research Submission Form"
              className="w-full"
              height={1400}
              loading="lazy"
            >
              Loading form…
            </iframe>
          </div>
        </div>
      </section>
    </div>
  );
}
