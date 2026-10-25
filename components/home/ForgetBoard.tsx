"use client";

import { useEffect } from "react";
import { forgetBoard } from "@/lib/recentBoards";

// Rendered on "game not found" pages so expired or deleted boards drop out of
// the home page's "Your boards" list.
export function ForgetBoard({ id }: { id: string }) {
  useEffect(() => {
    forgetBoard(id);
  }, [id]);
  return null;
}
