import React from 'react';
import clsx from 'clsx';
import { getIllustration, IllustrationKey } from '../../data/illustrations';

interface IllustrationProps {
  illustrationKey?: IllustrationKey;
  src?: string;
  alt?: string;
  className?: string;
  overlayClassName?: string;
  heightClassName?: string;
}

const Illustration: React.FC<IllustrationProps> = ({
  illustrationKey,
  src,
  alt,
  className,
  overlayClassName,
  heightClassName = 'h-40 md:h-52',
}) => {
  const meta = getIllustration(illustrationKey);
  const finalSrc = src ?? meta?.src;
  const finalAlt = alt ?? meta?.alt ?? '';
  const overlay = overlayClassName ?? meta?.overlay ?? 'from-black/20 via-transparent to-transparent';

  return (
    <div className={clsx('relative overflow-hidden rounded-sm', heightClassName, className)}>
      {finalSrc ? (
        <img src={finalSrc} alt={finalAlt} className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-[#fcf9f2] via-[#f4f1e8] to-[#e8dcc2]" />
      )}
      <div className={clsx('absolute inset-0 bg-gradient-to-r', overlay)} />
    </div>
  );
};

export default Illustration;
