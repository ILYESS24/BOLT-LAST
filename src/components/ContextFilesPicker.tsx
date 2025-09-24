import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { File } from '@/lib/schemas';

interface ContextFilesPickerProps {
  files: File[];
  selectedFiles: string[];
  onSelectionChange: (selectedIds: string[]) => void;
  className?: string;
}

export function ContextFilesPicker({ 
  files, 
  selectedFiles, 
  onSelectionChange,
  className 
}: ContextFilesPickerProps) {
  // const [isOpen, setIsOpen] = useState(false);

  const handleFileToggle = (fileId: string) => {
    const newSelection = selectedFiles.includes(fileId)
      ? selectedFiles.filter(id => id !== fileId)
      : [...selectedFiles, fileId];
    onSelectionChange(newSelection);
  };

  const handleSelectAll = () => {
    onSelectionChange(files.map(f => f.id));
  };

  const handleSelectNone = () => {
    onSelectionChange([]);
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Fichiers de contexte</CardTitle>
        <CardDescription>
          Sélectionnez les fichiers à inclure dans le contexte
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={handleSelectAll}>
              Tout sélectionner
            </Button>
            <Button variant="outline" size="sm" onClick={handleSelectNone}>
              Tout désélectionner
            </Button>
          </div>

          <div className="max-h-64 overflow-y-auto space-y-2">
            {files.map((file) => (
              <div
                key={file.id}
                className={`flex items-center space-x-2 p-2 border rounded cursor-pointer transition-colors ${
                  selectedFiles.includes(file.id)
                    ? 'bg-primary/10 border-primary'
                    : 'hover:bg-muted'
                }`}
                onClick={() => handleFileToggle(file.id)}
              >
                <input
                  type="checkbox"
                  checked={selectedFiles.includes(file.id)}
                  onChange={() => handleFileToggle(file.id)}
                  className="rounded"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.path}</p>
                  <p className="text-xs text-muted-foreground">
                    {file.size} bytes
                  </p>
                </div>
              </div>
            ))}
          </div>

          {selectedFiles.length > 0 && (
            <div className="text-sm text-muted-foreground">
              {selectedFiles.length} fichier(s) sélectionné(s)
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}