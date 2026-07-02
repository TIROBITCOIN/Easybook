import { EmptyState } from '../components/EmptyState';

export function CategoriesPage() {
  return (
    <EmptyState
      description="AI가 분석하면서 카테고리를 자동 생성할 예정입니다."
      title="아직 카테고리가 없습니다."
    />
  );
}
