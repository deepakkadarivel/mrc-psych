import { notFound } from "next/navigation";
import { PaperARecallsPanel } from "@/components/paper-a-recalls-panel";
import { TopicView } from "@/components/topic-view";
import {
  getPaperAManifest,
  getPaperANotes,
  getPaperAQuestions,
  getPaperAStudyGuide,
  getPaperATopic,
} from "@/lib/content-paper-a";

export function generateStaticParams() {
  return getPaperAManifest().topics.map((t) => ({ slug: t.id }));
}

export default async function PaperATopicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const topic = getPaperATopic(slug);
  if (!topic) notFound();
  return (
    <>
      <TopicView
        topic={topic}
        notes={getPaperANotes(slug)}
        studyGuide={getPaperAStudyGuide(slug)}
        questions={getPaperAQuestions(slug)}
        quizHref={`/paper-a/quiz/${slug}`}
      />
      <PaperARecallsPanel topicId={slug} />
    </>
  );
}
