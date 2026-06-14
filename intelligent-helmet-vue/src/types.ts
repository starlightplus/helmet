export type AuthMode = 'signin' | 'signup' | 'forgot';

export interface FloatingInputProps {
  id: string;
  label: string;
  type: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}
