import { notFound } from "next/navigation";
import { ExamTrendSectionView } from "@/components/exam-trend-section-view";
import { getExamTrends, getExamTrendSection } from "@/lib/content";

export function generateStaticParams() {
  return getExamTrends().sections.map((s) => ({ slug: s.id }));
}

export default async function ExamTrendSectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const section = getExamTrendSection(slug);
  if (!section) notFound();

  return <ExamTrendSectionView section={section} />;
}
