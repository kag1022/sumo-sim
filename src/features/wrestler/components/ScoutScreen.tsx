
import React, { useState } from 'react';
import { Candidate } from '../../../types';
import { getGrade } from '../logic/scouting';
import { useGame } from '../../../context/GameContext';
import { useTranslation } from 'react-i18next';
import { Leaf } from 'lucide-react';
import { CandidateCard } from './CandidateCard';
import { InspectionModal } from './InspectionModal';
import ModalShell from '../../../components/ui/ModalShell';
import SectionHeader from '../../../components/ui/SectionHeader';
import KpiChip from '../../../components/ui/KpiChip';
import EmptyState from '../../../components/ui/EmptyState';

interface ScoutScreenProps {
    candidates: Candidate[];
    funds: number;
    currentCount: number;
    limit: number;
    onRecruit: (candidate: Candidate, customName?: string) => void;
    onInspect: (cost: number) => void;
    onClose: () => void;
}

const ScoutScreen: React.FC<ScoutScreenProps> = ({ candidates, funds, currentCount, limit, onRecruit, onInspect, onClose }) => {
    const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
    const INSPECTION_FEE = 300000;

    const { reputation } = useGame();
    const { t } = useTranslation();
    const grade = getGrade(reputation);
    const gradeColor =
        grade === 'S' ? 'text-amber-500' :
        grade === 'A' ? 'text-[#b7282e]' :
        grade === 'B' ? 'text-blue-600' :
        'text-slate-400';

    const handleInspect = (candidate: Candidate) => {
        if (funds < INSPECTION_FEE) return;
        onInspect(INSPECTION_FEE);
        setSelectedCandidate(candidate);
    };

    const handleRecruit = (customName: string) => {
        if (selectedCandidate) {
            onRecruit(selectedCandidate, customName);
            setSelectedCandidate(null);
        }
    };

    return (
            <ModalShell
            onClose={onClose}
            header={<></>}
            className="max-w-6xl h-[90vh] border border-[#b7282e]"
            bodyClassName="flex flex-col h-full"
            overlayClassName="z-[100] bg-black/60"
        >
            
            {selectedCandidate && (
                <InspectionModal 
                    candidate={selectedCandidate}
                    onApprove={handleRecruit}
                    onReject={() => setSelectedCandidate(null)}
                />
            )}

            {/* Header Section */}
            <div className="px-6 pt-6">
                <SectionHeader
                    eyebrow={t('scout.dept_name')}
                    title={t('scout.title')}
                    subtitle={t('scout.subtitle')}
                    illustrationKey="scout"
                    icon={<Leaf className="w-4 h-4" />}
                    actions={
                        <div className="flex flex-wrap items-center gap-2 justify-end">
                            <KpiChip
                                label={t('scout.current_rank_label')}
                                value={
                                    <span className="flex items-baseline gap-1">
                                        <span className={`font-serif font-black ${gradeColor}`}>{grade}</span>
                                        <span className="text-[10px] text-slate-400">{t('scout.rank_suffix')}</span>
                                    </span>
                                }
                            />
                            <KpiChip label={t('scout.funds_label')} value={`¥${funds.toLocaleString()}`} />
                            <KpiChip label={t('scout.members_label')} value={`${currentCount}/${limit}`} />
                        </div>
                    }
                />
            </div>

            {/* Content Grid */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-[var(--color-sumo-cream)] custom-scrollbar">
                    {candidates.length === 0 ? (
                        <EmptyState
                            icon={<Leaf className="w-12 h-12" />}
                            title={t('scout.no_candidates')}
                            description={t('scout.wait_next_week')}
                        />
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {candidates.map(c => (
                                <CandidateCard
                                    key={c.id}
                                    candidate={c}
                                    funds={funds}
                                    inspectionFee={INSPECTION_FEE}
                                    isFull={currentCount >= limit}
                                    onInspect={handleInspect}
                                />
                            ))}
                        </div>
                    )}
                </div>
        </ModalShell>
    );
};

export default ScoutScreen;
