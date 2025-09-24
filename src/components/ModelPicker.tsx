import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Model } from '@/lib/schemas';

interface ModelPickerProps {
  value?: string;
  onValueChange?: (value: string) => void;
  models?: Model[];
  className?: string;
}

export function ModelPicker({ 
  value, 
  onValueChange, 
  models = [],
  className 
}: ModelPickerProps) {
  const defaultModels: Model[] = [
    {
      id: 'gpt-4',
      name: 'GPT-4',
      provider: 'openai',
      maxTokens: 8192,
      description: 'Le modèle le plus avancé d\'OpenAI'
    },
    {
      id: 'gpt-3.5-turbo',
      name: 'GPT-3.5 Turbo',
      provider: 'openai',
      maxTokens: 4096,
      description: 'Rapide et efficace'
    },
    {
      id: 'claude-3',
      name: 'Claude 3',
      provider: 'anthropic',
      maxTokens: 200000,
      description: 'Modèle d\'Anthropic avec un grand contexte'
    }
  ];

  const availableModels = models.length > 0 ? models : defaultModels;

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={className}>
        <SelectValue placeholder="Sélectionner un modèle" />
      </SelectTrigger>
      <SelectContent>
        {availableModels.map((model) => (
          <SelectItem key={model.id} value={model.id}>
            <div className="flex flex-col">
              <span className="font-medium">{model.name}</span>
              {model.description && (
                <span className="text-xs text-muted-foreground">
                  {model.description}
                </span>
              )}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}