import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Users, UserX, Clock } from 'lucide-react';
import { Student } from '@/types/poll';

interface ParticipantsListProps {
  students: Student[];
  onRemoveStudent: (studentId: string) => void;
}

export const ParticipantsList: React.FC<ParticipantsListProps> = ({ 
  students, 
  onRemoveStudent 
}) => {
  const formatJoinTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <Card className="shadow-poll">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Participants
          </div>
          <Badge variant="secondary" className="text-sm">
            {students.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="px-4 pb-2">
          <div className="grid grid-cols-2 gap-4 text-xs font-medium text-muted-foreground">
            <span>Name</span>
            <span>Action</span>
          </div>
        </div>
        
        <ScrollArea className="h-80">
          <div className="px-4 space-y-2 pb-4">
            {students.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No participants yet.
              </div>
            ) : (
              students.map((student) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">{student.name}</span>
                      {student.hasAnswered && (
                        <Badge variant="default" className="text-xs">
                          Answered
                        </Badge>
                      )}
                    </div>
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <Clock className="w-3 h-3" />
                      <span>Joined {formatJoinTime(student.joinTime)}</span>
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveStudent(student.id)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 ml-2"
                  >
                    <UserX className="w-4 h-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};