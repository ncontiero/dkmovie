import { Link } from "react-router";
import { AlertTriangle } from "lucide-react";
import { Meta } from "@/components/meta";
import { Button } from "@/components/ui/button";

export default function PageNotFound() {
  return (
    <div className="bg-background text-foreground flex min-h-screen flex-col items-center justify-center text-center">
      <Meta title="Page Not Found" />
      <div className="mb-6">
        <AlertTriangle className="text-primary size-16" />
      </div>

      <h1 className="text-foreground mb-4 text-6xl font-extrabold md:text-8xl">
        404
      </h1>

      <h2 className="text-foreground mb-3 text-2xl font-semibold md:text-3xl">
        Page Not Found
      </h2>

      <p className="text-muted-foreground mb-8 max-w-md text-lg">
        Sorry, we couldn&apos;t find the page you&apos;re looking for. It may
        have been moved or deleted.
      </p>

      <div>
        <Button
          asChild
          size="lg"
          className="font-semibold shadow-lg transition-all hover:scale-105"
        >
          <Link to="/">Return to Homepage</Link>
        </Button>
      </div>
    </div>
  );
}
