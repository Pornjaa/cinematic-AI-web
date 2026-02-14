import { auth } from "@/auth";
import { db } from "@/lib/db";
import { CommentForm } from "@/components/shared/comment-form";

export async function CommentList({ articleId, tutorialId }: { articleId?: string; tutorialId?: string }) {
  const session = await auth();
  const comments = await db.comment.findMany({
    where: articleId ? { articleId, isApproved: true } : { tutorialId, isApproved: true },
    include: { user: true },
    orderBy: { createdAt: "desc" }
  });

  return (
    <section className="space-y-4">
      <h3 className="text-lg font-semibold">Comments</h3>
      {session?.user && <CommentForm articleId={articleId} tutorialId={tutorialId} />}
      {!session?.user && <p className="text-sm text-zinc-300">Login to comment.</p>}
      {comments.map((comment) => (
        <div key={comment.id} className="rounded-2xl cinematic-card p-4">
          <p className="text-sm text-zinc-400">{comment.user.name ?? comment.user.email}</p>
          <p>{comment.body}</p>
        </div>
      ))}
    </section>
  );
}
