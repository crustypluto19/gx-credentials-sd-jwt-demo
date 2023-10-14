import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Graph } from "jsoncrack-react";
import { NetworkIcon } from "lucide-react";

type Props = {
  jwt: string;
  title: string;
  description?: string;
};

const JsonGraphDialog = ({ jwt, title, description }: Props) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary" disabled={!jwt}>
          {/* Graph */}
          <NetworkIcon className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[120vh] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {
                description? description : "This is a JSON graph of the corresponding JSON object."
            }
          </DialogDescription>
        </DialogHeader>
        <Graph className="max-w-[114vh]" json={jwt} />
      </DialogContent>
    </Dialog>
  );
};

export default JsonGraphDialog;
