import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Poll } from '@/types/poll';
import { Clock } from 'lucide-react';

interface PollQuestionProps {
  poll: Poll;
  onSubmit: (optionId: string) => void;
  disabled?: boolean;
  timeRemaining?: number;
}

export const PollQuestion: React.FC<PollQuestionProps> = ({ 
  poll, 
  onSubmit, 
  disabled = false,
  timeRemaining 
}) => {
  const [selectedOption, setSelectedOption] = useState<string>('');

  const handleSubmit = () => {
    if (selectedOption) {
      onSubmit(selectedOption);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Question 1</h1>
          {timeRemaining !== undefined && (
            <div className="flex items-center gap-2 text-poll-error">
              <Clock className="w-5 h-5" />
              <span className="font-mono text-lg font-bold">
                {formatTime(timeRemaining)}
              </span>
            </div>
          )}
        </div>

        <Card className="shadow-poll">
          <CardContent className="p-0">
            <div className="bg-gray-700 text-white p-4 rounded-t-lg">
              <p className="text-lg font-medium">{poll.question}</p>
            </div>
            
            <div className="p-6">
              <RadioGroup 
                value={selectedOption} 
                onValueChange={setSelectedOption}
                disabled={disabled}
                className="space-y-4"
              >
                {poll.options.map((option, index) => (
                  <div 
                    key={option.id}
                    className="flex items-center space-x-3 p-4 rounded-lg border-2 border-muted hover:border-primary/50 transition-colors"
                  >
                    <RadioGroupItem value={option.id} id={option.id} />
                    <Label 
                      htmlFor={option.id}
                      className="flex-1 text-lg cursor-pointer flex items-center gap-3"
                    >
                      <Badge variant="secondary" className="w-8 h-8 rounded-full flex items-center justify-center">
                        {index + 1}
                      </Badge>
                      {option.text}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </CardContent>
        </Card>

        <Button
          onClick={handleSubmit}
          disabled={!selectedOption || disabled}
          variant="gradient"
          size="lg"
          className="w-full py-3 text-lg font-medium"
        >
          Submit
        </Button>
      </div>
    </div>
  );
};