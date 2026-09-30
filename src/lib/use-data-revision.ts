"use client";

import { useEffect, useState } from "react";
import { subscribeToDataChanges } from "./services/browser-store";

export function useDataRevision() {
  const [revision, setRevision] = useState(0);

  useEffect(() => subscribeToDataChanges(() => setRevision((value) => value + 1)), []);

  return revision;
}
