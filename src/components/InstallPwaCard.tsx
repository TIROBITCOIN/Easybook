import { useEffect, useState } from 'react';
import { type BeforeInstallPromptEvent, isStandaloneDisplayMode } from '../pwa/installPrompt';

export function InstallPwaCard() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    setIsStandalone(isStandaloneDisplayMode());

    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };

    const onAppInstalled = () => {
      setIsStandalone(true);
      setInstallPrompt(null);
      setMessage('설치됨');
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    window.addEventListener('appinstalled', onAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
      window.removeEventListener('appinstalled', onAppInstalled);
    };
  }, []);

  const install = async () => {
    if (!installPrompt) {
      return;
    }

    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    setInstallPrompt(null);
    setMessage(choice.outcome === 'accepted' ? '설치를 시작했습니다.' : '설치를 취소했습니다.');
  };

  return (
    <section className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
      <div>
        <h3 className="text-lg font-black text-white">앱 설치와 공유</h3>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          Easybook은 홈 화면에 설치해서 사용할 수 있습니다. 설치 후 X/Twitter 또는 브라우저의 공유 메뉴에서 Easybook으로 링크를 보낼 수 있습니다.
        </p>
      </div>

      {isStandalone ? (
        <p className="rounded-2xl border border-emerald-300/30 bg-emerald-300/10 p-4 text-sm font-bold text-emerald-200">설치됨</p>
      ) : installPrompt ? (
        <button className="min-h-12 w-full rounded-2xl bg-sky-300 px-5 text-sm font-black text-slate-950" onClick={install} type="button">
          Easybook 설치하기
        </button>
      ) : (
        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 text-sm leading-6 text-slate-400">
          <p className="font-bold text-slate-200">수동 설치 안내</p>
          <p className="mt-2">Chrome/Edge: 주소창 오른쪽 설치 아이콘 또는 메뉴 → 앱 설치</p>
          <p>Android: 브라우저 메뉴 → 홈 화면에 추가</p>
          <p>iOS Safari: 공유 버튼 → 홈 화면에 추가</p>
        </div>
      )}

      <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 text-sm leading-6 text-slate-400">
        <p>브라우저/기기마다 공유 대상 지원이 다를 수 있습니다.</p>
        <p>공유 기능이 보이지 않으면 링크를 복사해서 추가 화면에 붙여넣으세요.</p>
      </div>

      {message ? <p className="text-sm font-bold text-sky-200">{message}</p> : null}
    </section>
  );
}
