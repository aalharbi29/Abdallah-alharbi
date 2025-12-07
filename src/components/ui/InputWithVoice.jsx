import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import VoiceInput from './VoiceInput';
import { cn } from '@/lib/utils';

export function InputWithVoice({ 
  value, 
  onChange, 
  className,
  inputClassName,
  multiline = false,
  rows = 3,
  ...props 
}) {
  const handleVoiceResult = (transcript) => {
    const newValue = value ? `${value} ${transcript}` : transcript;
    onChange({ target: { value: newValue } });
  };

  const InputComponent = multiline ? Textarea : Input;

  return (
    <div className={cn("relative flex gap-2", className)}>
      <InputComponent
        value={value}
        onChange={onChange}
        className={cn("flex-1", inputClassName)}
        rows={multiline ? rows : undefined}
        {...props}
      />
      <VoiceInput 
        onResult={handleVoiceResult}
        className="shrink-0"
      />
    </div>
  );
}

export default InputWithVoice;