import React from 'react';
import {
  CalendarMonth,
  AttachMoney,
  Schedule,
  Share,
  Download,
  ContentCopy,
} from '@mui/icons-material';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import type { TravelPlan } from '../../types/ai-travel-planner';

interface PlanDetailHeaderProps {
  plan: TravelPlan;
}

const PlanDetailHeader: React.FC<PlanDetailHeaderProps> = ({ plan }) => {
  return (
    <Card className="rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 border-l-4 border-l-teal-500 mt-4 sm:mt-6">
      <CardContent className="p-4 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 sm:mb-2">
              {plan.destination}
            </h1>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-white/80">
              <span className="flex items-center gap-1">
                <CalendarMonth className="h-4 w-4 sm:h-5 sm:w-5 text-teal-400" />
                <span className="text-sm sm:text-base">{plan.duration} days</span>
              </span>
              <span className="flex items-center gap-1">
                <AttachMoney className="h-4 w-4 sm:h-5 sm:w-5 text-teal-400" />
                <span className="text-sm sm:text-base">
                  ${plan.budget} {plan.currency}
                </span>
              </span>
              <span className="flex items-center gap-1">
                <Schedule className="h-4 w-4 sm:h-5 sm:w-5 text-teal-400" />
                <span className="text-sm sm:text-base">
                  {plan.startDate} - {plan.endDate}
                </span>
              </span>
            </div>
          </div>
          <div className="flex gap-2 self-start">
            <Button variant="outline" size="icon" className="rounded-xl h-8 w-8 sm:h-10 sm:w-10 bg-white/10 border-white/20 text-white hover:bg-white/20">
              <Share className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
            <Button variant="outline" size="icon" className="rounded-xl h-8 w-8 sm:h-10 sm:w-10 bg-white/10 border-white/20 text-white hover:bg-white/20">
              <Download className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
            <Button variant="outline" size="icon" className="rounded-xl h-8 w-8 sm:h-10 sm:w-10 bg-white/10 border-white/20 text-white hover:bg-white/20">
              <ContentCopy className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PlanDetailHeader;