import { redirect } from "next/navigation";
import { connection } from "next/server";
import { newGameId } from "@/lib/id";

export default async function NewGamePage() {
  // Without this the page is prerendered at build time, baking a single id
  // into the redirect so every visitor lands on the same board.
  await connection();
  const id = newGameId();
  redirect(`/game/${id}/edit?new=1`);
}
