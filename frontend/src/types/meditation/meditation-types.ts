export interface MeditationOption {
  id: string;
  label: string;
  icon: string;
  description: string;
  sessions: number;
  avgDuration: string;
  subOptions?: SubOption[];
}

export interface SubOption {
  id: string;
  label: string;
  description: string;
  duration: number[];
  audioUrl?: string;
  narrator?: string;
}