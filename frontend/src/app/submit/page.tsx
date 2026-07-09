import { ExternalLink } from 'lucide-react';

// Google Forms requires sign-in for forms with File Upload questions, which
// blocks it from being embedded in an iframe (sign-in pages can't be framed) —
// so this links out instead of embedding.
const GOOGLE_FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSeMW8v3SrQDQhL8ek82qgyfTRT85vnTv1QkIdsxrChm4p-3Tw/viewform';

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

          <div className="card text-center">
            <p className="text-text-secondary mb-6">
              Submissions are collected through our research submission form, including any supporting files.
            </p>
            <a
              href={GOOGLE_FORM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
            >
              Open Submission Form
              <ExternalLink size={18} />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
