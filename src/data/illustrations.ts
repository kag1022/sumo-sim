export type IllustrationKey =
  | 'title'
  | 'training'
  | 'basho'
  | 'management'
  | 'history'
  | 'encyclopedia';

export interface IllustrationMeta {
  src?: string;
  alt: string;
  overlay?: string;
}

const titleSrc = new URL('../assets/ai/title.svg', import.meta.url).toString();
const sectionSrc = new URL('../assets/ai/section.svg', import.meta.url).toString();

export const illustrations: Record<IllustrationKey, IllustrationMeta> = {
  title: {
    src: titleSrc,
    alt: 'Title illustration',
    overlay: 'from-[#0b0b0b]/40 via-transparent to-transparent',
  },
  training: {
    src: sectionSrc,
    alt: 'Training header illustration',
    overlay: 'from-[#0b0b0b]/20 via-transparent to-transparent',
  },
  basho: {
    src: sectionSrc,
    alt: 'Basho header illustration',
    overlay: 'from-[#0b0b0b]/20 via-transparent to-transparent',
  },
  management: {
    src: sectionSrc,
    alt: 'Management header illustration',
    overlay: 'from-[#0b0b0b]/20 via-transparent to-transparent',
  },
  history: {
    src: sectionSrc,
    alt: 'History header illustration',
    overlay: 'from-[#0b0b0b]/20 via-transparent to-transparent',
  },
  encyclopedia: {
    src: sectionSrc,
    alt: 'Encyclopedia header illustration',
    overlay: 'from-[#0b0b0b]/20 via-transparent to-transparent',
  },
};

export const getIllustration = (key?: IllustrationKey) => {
  if (!key) return undefined;
  return illustrations[key];
};
