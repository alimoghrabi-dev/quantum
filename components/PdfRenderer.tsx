"use client";

import {
  ChevronDown,
  ChevronUp,
  Loader2,
  RotateCw,
  Search,
} from "lucide-react";
import { Document, Page, pdfjs } from "react-pdf";
import { useToast } from "./ui/use-toast";
import { useResizeDetector } from "react-resize-detector";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import PdfFullScreen from "./PdfFullScreen";
import Simplebar from "simplebar-react";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

interface PdfRendererProps {
  url: string;
}

const PdfRenderer = ({ url }: PdfRendererProps) => {
  const { toast } = useToast();

  const [pages, setPages] = useState<number>();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(1);
  const [currentRotation, setCurrentRotation] = useState<number>(0);
  const [renderedScale, setRenderedScale] = useState<number | null>(null);

  const isLoading = renderedScale !== scale;

  const CustomPageValidator = z.object({
    pageValue: z
      .string()
      .refine((num) => Number(num) > 0 && Number(num) <= pages!),
  });

  type TCustomPageValidator = z.infer<typeof CustomPageValidator>;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<TCustomPageValidator>({
    defaultValues: {
      pageValue: "1",
    },
    resolver: zodResolver(CustomPageValidator),
  });

  const handlePageSubmit = ({ pageValue }: TCustomPageValidator) => {
    setCurrentPage(Number(pageValue));
    setValue("pageValue", String(pageValue));
  };

  const { width, ref } = useResizeDetector();

  return (
    <div className="w-full bg-white rounded-md shadow flex flex-col items-center">
      <div className="h-14 w-full border-b border-zinc-200 flex items-center justify-between px-1 sm:px-2">
        <div className="flex items-center gap-0 sm:gap-5">
          <Button
            disabled={currentPage <= 1}
            onClick={() =>
              setCurrentPage((prev) => (prev - 1 > 0 ? prev - 1 : 1))
            }
            variant={"ghost"}
            aria-label="previous page">
            <ChevronDown className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-2">
            <Input
              {...register("pageValue")}
              value={String(currentPage)}
              className={cn(
                "w-12 h-8",
                errors.pageValue && "focus-visible:ring-red-600"
              )}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSubmit(handlePageSubmit)();
                }
              }}
            />
            <p className="text-zinc-700 text-sm font-medium flex items-center space-x-1">
              <span>/</span>
              <span>
                {pages ?? (
                  <Loader2 className="h-[13px] w-[13px] animate-spin" />
                )}
              </span>
            </p>
          </div>
          <Button
            disabled={currentPage === pages || pages === null}
            onClick={() =>
              setCurrentPage((prev) => (prev + 1 > pages! ? pages! : prev + 1))
            }
            variant={"ghost"}
            aria-label="next page">
            <ChevronUp className="h-4 w-4" />
          </Button>
        </div>
        <div className="space-x-0 sm:space-x-2 flex items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant={"ghost"}
                aria-label="zoom"
                className="gap-2 flex items-center">
                <Search className="h-4 w-4" />
                {scale * 100}%
                <ChevronDown className="h-4 w-4 opacity-75" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onSelect={() => setScale(1)}>
                100%
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setScale(1.5)}>
                150%
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setScale(2)}>
                200%
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setScale(2.5)}>
                250%
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            onClick={() => setCurrentRotation((prev) => prev + 90)}
            variant={"ghost"}
            aria-label="rotate-90">
            <RotateCw className="h-4 w-4" />
          </Button>

          <PdfFullScreen url={url} />
        </div>
      </div>

      <div className="flex-1 w-full max-h-screen">
        <Simplebar autoHide={false} className="max-h-[calc(100vh-10rem)]">
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
              {isLoading && renderedScale ? (
                <Page
                  width={width}
                  pageNumber={currentPage}
                  scale={scale}
                  key={"@" + renderedScale}
                  rotate={currentRotation}
                />
              ) : null}
              <Page
                className={cn(isLoading ? "hidden" : "")}
                width={width}
                pageNumber={currentPage}
                scale={scale}
                rotate={currentRotation}
                key={"@" + scale}
                loading={
                  <div className="flex justify-center">
                    <Loader2 className="my-24 h-6 w-6 animate-spin" />
                  </div>
                }
                onRenderSuccess={() => setRenderedScale(scale)}
              />
            </Document>
          </div>
        </Simplebar>
      </div>
    </div>
  );
};

export default PdfRenderer;
