import { RotateCcw } from 'lucide-react';
import { useTranslation } from 'react-i18next';

/**
 * モバイル縦画面時に回転を促すガードコンポーネント
 */
export const OrientationGuard = () => {
    const { t } = useTranslation();

    return (
        <div className="fixed inset-0 z-[100] bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center portrait:flex landscape:hidden">
            <div className="mb-6 animate-pulse">
                <RotateCcw className="w-16 h-16 md:w-24 md:h-24 text-amber-400" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold font-serif mb-4 text-amber-400">
                {t('orientation_guard.title')}
            </h2>
            <p className="text-slate-300 max-w-md font-sans leading-relaxed">
                {t('orientation_guard.message')}
            </p>
        </div>
    );
};
