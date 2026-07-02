import { EmptyState } from '../components/EmptyState';

export function BookmarksPage() {
  return (
    <EmptyState
      actionLabel="북마크 추가하기"
      actionTo="/add"
      description="다음 PR에서 IndexedDB 저장소와 북마크 목록 기능이 연결됩니다."
      title="아직 저장된 북마크가 없습니다."
    />
  );
}
