import { EmptyState } from '../components/EmptyState';

export function CategoriesPage() {
  return (
    <EmptyState
      description="다음 PR에서 AI mock 분석이 추가되면 카테고리 자동 생성 흐름을 연결할 예정입니다."
      title="아직 카테고리가 없습니다."
    />
  );
}
