import { useState } from "react";
import { Meta } from "@/components/meta";

export default function HomePage() {
  const [count, setCount] = useState(0);

  return (
    <div className="my-20 flex flex-col items-center justify-center">
      <Meta overrideTitle />
      <h1>Count: {count}</h1>
      <button type="button" onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
}
