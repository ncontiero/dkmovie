import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/title/$titleId/watch")({
  component: WatchTitleComponent,
});

function WatchTitleComponent() {
  return <div>Hello &quot;/title/$titleId/watch&quot;!</div>;
}
