"use client";

import { useEffect, useState } from "react";

export function ClientDate({ dateString }: { dateString: string | Date }) {
  const [formatted, setFormatted] = useState<string>("");

  useEffect(() => {
    try {
      const d = new Date(dateString);
      setFormatted(d.toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }));
    } catch {
      setFormatted("Invalid Date");
    }
  }, [dateString]);

  // Prevent hydration mismatch by rendering a skeleton or raw string on server
  if (!formatted) {
    return <span className="opacity-50">Loading...</span>;
  }

  return <span>{formatted}</span>;
}
