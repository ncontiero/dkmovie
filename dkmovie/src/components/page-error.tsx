import { Link } from "react-router";

interface PageErrorProps {
  readonly title: string;
  readonly description: string;
}

export function PageError({ title, description }: PageErrorProps) {
  return (
    <main className="mt-10 flex flex-col items-center justify-center text-center">
      <h1 className="text-4xl font-bold tracking-wide">{title}</h1>
      <p className="mt-4 text-lg">{description}</p>
      <p className="mt-2 text-base">
        Go back to the <Link to="/">home</Link>.
      </p>
    </main>
  );
}
