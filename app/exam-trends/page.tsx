import { ExamTrendsView } from "@/components/exam-trends-view";
import { getExamTrends } from "@/lib/content";

export default function ExamTrendsPage() {
  return <ExamTrendsView data={getExamTrends()} />;
}
