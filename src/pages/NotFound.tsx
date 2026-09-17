import { Link } from "react-router-dom";

export function NotFound() {
  return (
    <div className="container-page py-24 text-center">
      <p className="eyebrow">404</p>
      <h1 className="mt-3 font-serif text-4xl font-semibold">That page isn't here</h1>
      <p className="mx-auto mt-4 max-w-md text-navy/65">
        The link may be outdated. Everything in the prototype is reachable from
        the home page.
      </p>
      <Link to="/" className="btn-primary mt-8">
        Back to home
      </Link>
    </div>
  );
}
