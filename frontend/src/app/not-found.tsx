import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="pt-16 min-h-screen flex items-center justify-center">
      <div className="text-center px-4">
        <p className="text-8xl font-bold text-primary/20 mb-4">404</p>
        <h1 className="heading-lg mb-3">Page not found</h1>
        <p className="text-text-tertiary mb-8 max-w-sm mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" className="btn-primary">Return Home</Link>
          <Link href="/contact" className="btn-secondary">Contact Us</Link>
        </div>
      </div>
    </div>
  );
}
