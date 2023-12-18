import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import { Expand, Loader2 } from "lucide-react";
import SimpleBar from "simplebar-react";
import { Page, Document } from "react-pdf";
import { useToast } from "./ui/use-toast";
import { useResizeDetector } from "react-resize-detector";

const PdfFullScreen = ({ url }: { url: string }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [pages, setPages] = useState<number>();

  const { toast } = useToast();

  const { width, ref } = useResizeDetector();

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(v) => {
        if (!v) {
          setIsOpen(v);
        }
      }}>
      <DialogTrigger onClick={() => setIsOpen(true)} asChild>
        <Button variant={"ghost"} aria-label="fullscreen" className="gap-1.5">
          <Expand className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-7xl w-full">
        <SimpleBar autoHide={false} className="max-h-[calc(100vh-10rem)] mt-6">
          <div ref={ref}>
            <Document
              loading={
                <div className="flex justify-center">
                  <Loader2 className="my-24 h-6 w-6 animate-spin" />
                </div>
              }
              onLoadSuccess={({ numPages }) => {
                setPages(numPages);
              }}
              onLoadError={() => {
                toast({
                  title: "Error loading file",
                  description: "Please Try again, and refresh page.",
                  variant: "destructive",
                });
              }}
              file={url}
              className={"max-h-full"}>
              {new Array(pages).fill(0).map((_, index) => (
                <Page key={index} width={width} pageNumber={index + 1} />
              ))}
            </Document>
          </div>
        </SimpleBar>
      </DialogContent>
    </Dialog>
  );
};

export default PdfFullScreen;
