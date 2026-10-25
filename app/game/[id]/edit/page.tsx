import Link from "next/link";
import { redirect } from "next/navigation";
import { buildBlankGame } from "@/lib/blank";
import { DEMO_GAME_ID, buildDemoGame } from "@/lib/demo";
import { newGameId } from "@/lib/id";
import { getGame } from "@/lib/store";
import { BoardEditor } from "@/components/editor/BoardEditor";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ForgetBoard } from "@/components/home/ForgetBoard";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ new?: string }>;
}

export default async function EditGamePage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { new: isNewFlag } = await searchParams;

  // The demo can't be edited in place, so editing it starts a personal copy.
  // Like a new board, the copy is only saved once something is changed.
  if (id === DEMO_GAME_ID) redirect(`/game/${newGameId()}/edit?new=demo`);

  try {
    let game = await getGame(id);

    if (!game) {
      if (isNewFlag === "1") {
        game = buildBlankGame(id);
      } else if (isNewFlag === "demo") {
        game = { ...buildDemoGame(), id };
      } else {
        return (
          <div className="mx-auto flex w-full max-w-2xl flex-1 items-center px-6 py-24">
            <ForgetBoard id={id} />
            <EmptyState
              icon="🧭"
              title="We couldn't find that game"
              description="The link might be mistyped, or this game hasn't been created yet."
              action={
                <Link href="/new">
                  <Button>Create a new game</Button>
                </Link>
              }
            />
          </div>
        );
      }
    }

    return <BoardEditor initialGame={game} />;
  } catch (err) {
    return <DatabaseError err={err} />;
  }
}

function DatabaseError({ err }: { err: unknown }) {
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
