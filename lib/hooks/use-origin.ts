"use client";

import { useState, useEffect } from "react";

export function useOrigin() {
  const [origin, setOrigin] = useState("http://localhost:3000");
  const [host, setHost] = useState("localhost:3000");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
      setHost(window.location.host);
    }
  }, []);

  return { origin, host };
}
