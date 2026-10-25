import Link from "next/link";
import { getGame } from "@/lib/store";
import { PlayScreen } from "@/components/play/PlayScreen";
import { buttonClasses } from "@/components/ui/buttonStyles";
import { AlertIcon, LostIcon } from "@/components/ui/Icons";
import { EmptyState } from "@/components/ui/EmptyState";
import { ForgetBoard } from "@/components/home/ForgetBoard";

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
          <ForgetBoard id={id} />
          <EmptyState
            icon={<LostIcon />}
            title="This game doesn't exist yet"
            description="Double-check the link, or start a fresh board of your own."
            action={
              <div className="flex flex-wrap justify-center gap-3">
                <Link href="/new" className={buttonClasses("primary")}>
                  Create a new game
                </Link>
                <Link href="/game/demo" className={buttonClasses("outline")}>
                  Play the demo
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
          icon={<AlertIcon />}
          title="Can't reach the database"
          description={
            err instanceof Error
              ? err.message
              : "Something went wrong loading this game. Check your database configuration and try again."
          }
          action={
            <Link href="/" className={buttonClasses("outline")}>
              Back home
            </Link>
          }
        />
      </div>
    );
  }
}
