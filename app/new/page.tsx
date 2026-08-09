import { redirect } from "next/navigation";
import { newGameId } from "@/lib/id";

export default function NewGamePage() {
  const id = newGameId();
  redirect(`/game/${id}/edit?new=1`);
}
