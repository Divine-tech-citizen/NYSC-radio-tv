"use client";

import { useEffect } from "react";
import { initializeAnalytics } from "@/lib/firebase";

export default function FirebaseAnalytics() {
  useEffect(() => {
    initializeAnalytics().catch((error: unknown) => {
      console.error("Firebase Analytics could not be initialized.", error);
    });
  }, []);

  return null;
}
