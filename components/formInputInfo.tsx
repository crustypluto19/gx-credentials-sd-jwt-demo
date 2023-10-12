import { InfoIcon } from "lucide-react";
import React from "react";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "./ui/tooltip";

type Props = {
  content: React.ReactNode;
};

const FormInputInfo = ({ content }: Props) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <InfoIcon className="inline-block ml-1 h-4 w-4" />
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default FormInputInfo;
