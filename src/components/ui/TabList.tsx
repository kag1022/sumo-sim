import React from 'react';
import clsx from 'clsx';

interface TabItem {
  id: string;
  label: string;
}

interface TabListProps {
  tabs: TabItem[];
  activeId: string;
  onChange: (id: string) => void;
  className?: string;
}

const TabList: React.FC<TabListProps> = ({ tabs, activeId, onChange, className }) => {
  return (
    <div className={clsx('flex gap-1 border-b border-[var(--color-sumo-line)] bg-white/60', className)}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeId;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={clsx(
              'px-5 py-3 text-sm font-bold transition-colors relative',
              isActive ? 'text-[#b7282e] bg-[var(--color-sumo-cream)]' : 'text-slate-400 hover:text-slate-700'
            )}
          >
            {tab.label}
            {isActive && <span className="absolute left-0 right-0 bottom-0 h-0.5 bg-[#b7282e]" />}
          </button>
        );
      })}
    </div>
  );
};

export default TabList;
