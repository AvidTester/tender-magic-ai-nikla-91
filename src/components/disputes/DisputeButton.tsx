
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Flag } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DisputeForm } from './DisputeForm';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface DisputeButtonProps {
  tenderId: string;
  tenderTitle: string;
  winnerId?: string;
  winnerName?: string;
  tenderEndDate: string;
  disputeTimeFrameDays: number;
  disputeType?: 'rejection' | 'winner';
  variant?: 'outline' | 'default' | 'destructive' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function DisputeButton({
  tenderId,
  tenderTitle,
  winnerId,
  winnerName,
  tenderEndDate,
  disputeTimeFrameDays = 7,
  disputeType = 'winner',
  variant = 'outline',
  size = 'sm'
}: DisputeButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isWithinTimeFrame, setIsWithinTimeFrame] = useState(false);
  const [daysLeft, setDaysLeft] = useState(0);
  
  useEffect(() => {
    // Calculate if we're still within the dispute window
    const canFileDispute = () => {
      const tenderEnd = new Date(tenderEndDate);
      const disputeDeadline = new Date(tenderEnd);
      
      // Use different timeframes based on dispute type
      const days = disputeType === 'rejection' ? 3 : disputeTimeFrameDays;
      disputeDeadline.setDate(disputeDeadline.getDate() + days);
      
      return new Date() <= disputeDeadline;
    };
    
    // Calculate days left for filing disputes
    const getDaysLeft = () => {
      const tenderEnd = new Date(tenderEndDate);
      const disputeDeadline = new Date(tenderEnd);
      
      // Use different timeframes based on dispute type
      const days = disputeType === 'rejection' ? 3 : disputeTimeFrameDays;
      disputeDeadline.setDate(disputeDeadline.getDate() + days);
      
      const now = new Date();
      const daysDiff = Math.ceil((disputeDeadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      return Math.max(0, daysDiff);
    };
    
    setIsWithinTimeFrame(canFileDispute());
    setDaysLeft(getDaysLeft());
  }, [tenderEndDate, disputeTimeFrameDays, disputeType]);
  
  const buttonText = disputeType === 'winner' ? 'File Dispute' : 'Dispute Rejection';
  const timeFrameDays = disputeType === 'rejection' ? 3 : disputeTimeFrameDays;

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex">
              <Button
                variant={variant}
                size={size}
                onClick={() => setIsDialogOpen(true)}
                disabled={!isWithinTimeFrame}
                className="flex items-center gap-2"
              >
                <Flag className="h-4 w-4" />
                {buttonText}
                {isWithinTimeFrame && daysLeft <= 3 && (
                  <span className="text-xs text-red-500 font-medium">{daysLeft} days left</span>
                )}
              </Button>
            </span>
          </TooltipTrigger>
          {!isWithinTimeFrame && (
            <TooltipContent>
              <p>The {timeFrameDays}-day window for filing {disputeType === 'winner' ? 'winner disputes' : 'rejection disputes'} has expired</p>
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {disputeType === 'winner' ? 'File a Dispute Against Winner Selection' : 'Dispute Submission Rejection'}
            </DialogTitle>
            <DialogDescription>
              {isWithinTimeFrame ? (
                <>
                  You have {daysLeft} days left to file a dispute 
                  {disputeType === 'winner' 
                    ? ' against the winner selection for this tender.' 
                    : ' against the rejection of your submission.'}
                  Please provide a detailed explanation for your dispute.
                </>
              ) : (
                <>
                  The {timeFrameDays}-day window for filing disputes for this tender has expired.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          
          {isWithinTimeFrame ? (
            <>
              <Alert variant="warning" className="mb-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Important</AlertTitle>
                <AlertDescription>
                  Disputes must be filed within {timeFrameDays} days of the decision date.
                  You have {daysLeft} days remaining.
                </AlertDescription>
              </Alert>
              <DisputeForm
                tenderId={tenderId}
                tenderTitle={tenderTitle}
                winnerId={winnerId}
                winnerName={winnerName}
                disputeType={disputeType}
                onSuccess={() => setIsDialogOpen(false)}
                onCancel={() => setIsDialogOpen(false)}
              />
            </>
          ) : (
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Close
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
