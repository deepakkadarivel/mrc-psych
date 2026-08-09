import { notFound } from "next/navigation";
import { TopicView } from "@/components/topic-view";
import { getManifest, getStudyGuide, getTopic, getTopicNotes, getTopicQuestions } from "@/lib/content";

export function generateStaticParams() {
  return getManifest().topics.map((t) => ({ slug: t.id }));
}

export default async function TopicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const topic = getTopic(slug);
  if (!topic) notFound();

  const notes = getTopicNotes(slug);
  const questions = getTopicQuestions(slug);
  const studyGuide = getStudyGuide(slug);

  return <TopicView topic={topic} notes={notes} studyGuide={studyGuide} questions={questions} />;
}
