import { Link } from "./ui/link";

export function Footer() {
  return (
    <footer className="bg-muted border-border mt-16 border-t">
      <div className="container mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div>
            <h4 className="text-muted-foreground text-sm font-semibold tracking-wider uppercase">
              Links
            </h4>
            <ul className="mt-4 space-y-2">
              <li>
                <Link to="/" variant="muted">
                  Frequently Asked Questions
                </Link>
              </li>
              <li>
                <Link to="/" variant="muted">
                  Privacy
                </Link>
              </li>
              <li>
                <Link to="/" variant="muted">
                  Speed Test
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-muted-foreground text-sm font-semibold tracking-wider uppercase">
              Help
            </h4>
            <ul className="mt-4 space-y-2">
              <li>
                <Link to="/" variant="muted">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/" variant="muted">
                  Terms of Use
                </Link>
              </li>
              <li>
                <Link to="/" variant="muted">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-muted-foreground text-sm font-semibold tracking-wider uppercase">
              Account
            </h4>
            <ul className="mt-4 space-y-2">
              <li>
                <Link to="/" variant="muted">
                  My Account
                </Link>
              </li>
              <li>
                <Link to="/" variant="muted">
                  Preferences
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-muted-foreground text-sm font-semibold tracking-wider uppercase">
              Media
            </h4>
            <ul className="mt-4 space-y-2">
              <li>
                <Link to="/" variant="muted">
                  Legal Notices
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <p className="text-muted-foreground/60 mt-10 text-center text-sm">
          &copy; {new Date().getFullYear()} DKMovie, Inc. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
