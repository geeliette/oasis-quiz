import Link from "next/link";
import { getGame } from "@/lib/store";
import { PlayScreen } from "@/components/play/PlayScreen";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PlayGamePage({ params }: PageProps) {
  const { id } = await params;

  try {
    const game = await getGame(id);

    if (!game) {
      return (
        <div className="mx-auto flex w-full max-w-2xl flex-1 items-center px-6 py-24">
          <EmptyState
            icon="🎯"
            title="This game doesn't exist yet"
            description="Double-check the link, or start a fresh board of your own."
            action={
              <div className="flex gap-2">
                <Link href="/new">
                  <Button>Create a new game</Button>
                </Link>
                <Link href="/game/demo">
                  <Button variant="outline">Play the demo</Button>
                </Link>
              </div>
            }
          />
        </div>
      );
    }

    return <PlayScreen initialGame={game} />;
  } catch (err) {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-1 items-center px-6 py-24">
        <EmptyState
          icon="⚠️"
          title="Can't reach the database"
          description={
            err instanceof Error
              ? err.message
              : "Something went wrong loading this game. Check your database configuration and try again."
          }
          action={
            <Link href="/">
              <Button variant="outline">Back home</Button>
            </Link>
          }
        />
      </div>
    );
  }
}
