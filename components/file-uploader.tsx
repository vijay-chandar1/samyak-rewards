'use client';

import { X, Upload } from 'lucide-react';
import * as React from 'react';
import Dropzone, {
  type DropzoneProps,
  type FileRejection
} from 'react-dropzone';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useControllableState } from '@/hooks/use-controllable-state';
import { cn, formatBytes } from '@/lib/utils';

// Utility function for image compression
async function compressImage(
  file: File,
  maxSizeKB: number = 200
): Promise<{
  base64: string;
  originalSize: number;
  compressedSize: number;
}> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Calculate the scaling factor
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 600;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;

        ctx?.drawImage(img, 0, 0, width, height);

        // Start with quality 0.9 and reduce until file size is acceptable
        let quality = 0.9;
        let compressedBase64 = canvas.toDataURL('image/jpeg', quality);
        const originalSize = file.size;

        while (compressedBase64.length / 1024 > maxSizeKB && quality > 0.1) {
          quality -= 0.1;
          compressedBase64 = canvas.toDataURL('image/jpeg', quality);
        }

        resolve({
          base64: compressedBase64,
          originalSize,
          compressedSize: compressedBase64.length / 1024
        });
      };
    };
    reader.onerror = (error) => reject(error);
  });
}

interface FileUploaderProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string[];
  onValueChange?: (value: string[]) => void;
  onUpload?: (files: string[]) => Promise<void>;
  accept?: DropzoneProps['accept'];
  maxSize?: DropzoneProps['maxSize'];
  maxFiles?: DropzoneProps['maxFiles'];
  multiple?: boolean;
  disabled?: boolean;
}

export function FileUploader(props: FileUploaderProps) {
  const {
    value: valueProp,
    onValueChange,
    onUpload,
    accept = { 'image/*': [] },
    maxSize = 1024 * 1024 * 2,
    maxFiles = 1,
    multiple = false,
    disabled = false,
    className,
    ...dropzoneProps
  } = props;

  const [files, setFiles] = useControllableState<string[]>({
    prop: valueProp,
    onChange: onValueChange
  });

  const [uploadProgress, setUploadProgress] = React.useState<number[]>([]);

  const onDrop = React.useCallback(
    async (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      if (!multiple && maxFiles === 1 && acceptedFiles.length > 1) {
        toast.error('Cannot upload more than 1 file at a time');
        return;
      }

      if ((files?.length ?? 0) + acceptedFiles.length > maxFiles) {
        toast.error(`Cannot upload more than ${maxFiles} files`);
        return;
      }

      try {
        // Compress and convert to base64
        const compressedFiles = await Promise.all(
          acceptedFiles.map(async (file) => await compressImage(file))
        );

        const compressedBase64 = compressedFiles.map((f) => f.base64);
        const updatedFiles = files
          ? [...files, ...compressedBase64]
          : compressedBase64;

        // Initialize upload progress for new files
        const newProgressStates = compressedFiles.map(() => 0);
        setUploadProgress((prev) => [...(prev ?? []), ...newProgressStates]);

        setFiles(updatedFiles);

        if (rejectedFiles.length > 0) {
          rejectedFiles.forEach(({ file }) => {
            toast.error(`File ${file.name} was rejected`);
          });
        }

        if (
          onUpload &&
          updatedFiles.length > 0 &&
          updatedFiles.length <= maxFiles
        ) {
          const target =
            updatedFiles.length > 0 ? `${updatedFiles.length} files` : `file`;

          const uploadPromise = onUpload(updatedFiles);

          // Simulated progress update (replace with actual upload progress if possible)
          const progressInterval = setInterval(() => {
            setUploadProgress((prev) =>
              prev.map((progress) =>
                progress < 100 ? progress + Math.random() * 20 : 100
              )
            );
          }, 500);

          toast.promise(uploadPromise, {
            loading: `Uploading ${target}...`,
            success: () => {
              clearInterval(progressInterval);
              setFiles([]);
              setUploadProgress([]);
              return `${target} uploaded`;
            },
            error: () => {
              clearInterval(progressInterval);
              return `Failed to upload ${target}`;
            }
          });
        }
      } catch (error) {
        console.error('Image compression error:', error);
        toast.error('Failed to compress image');
      }
    },
    [files, maxFiles, multiple, onUpload, setFiles]
  );

  function onRemove(index: number) {
    if (!files) return;
    const newFiles = files.filter((_, i) => i !== index);
    const newProgress = uploadProgress.filter((_, i) => i !== index);
    setFiles(newFiles);
    setUploadProgress(newProgress);
    if (onValueChange) {
      onValueChange(newFiles);
    }
  }

  const isDisabled = disabled || (files?.length ?? 0) >= maxFiles;

  return (
    <div className="relative flex flex-col gap-6 overflow-hidden">
      <Dropzone
        onDrop={onDrop}
        accept={accept}
        maxSize={maxSize}
        maxFiles={maxFiles}
        multiple={maxFiles > 1 || multiple}
        disabled={isDisabled}
      >
        {({ getRootProps, getInputProps, isDragActive }) => (
          <div
            {...getRootProps()}
            className={cn(
              'group relative grid h-52 w-full cursor-pointer place-items-center rounded-lg border-2 border-dashed border-muted-foreground/25 px-5 py-2.5 text-center transition hover:bg-muted/25',
              'ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              isDragActive && 'border-muted-foreground/50',
              isDisabled && 'pointer-events-none opacity-60',
              className
            )}
            {...dropzoneProps}
          >
            <input {...getInputProps()} />
            {isDragActive ? (
              <div className="flex flex-col items-center justify-center gap-4 sm:px-5">
                <div className="rounded-full border border-dashed p-3">
                  <Upload
                    className="size-7 text-muted-foreground"
                    aria-hidden="true"
                  />
                </div>
                <p className="font-medium text-muted-foreground">
                  Drop the files here
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-4 sm:px-5">
                <div className="rounded-full border border-dashed p-3">
                  <Upload
                    className="size-7 text-muted-foreground"
                    aria-hidden="true"
                  />
                </div>
                <div className="space-y-px">
                  <p className="font-medium text-muted-foreground">
                    Drag {`'n'`} drop files here, or click to select files
                  </p>
                  <p className="text-sm text-muted-foreground/70">
                    You can upload
                    {maxFiles > 1
                      ? ` ${maxFiles === Infinity ? 'multiple' : maxFiles}
                      files (up to ${formatBytes(maxSize)} each)`
                      : ` a file with ${formatBytes(maxSize)}`}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </Dropzone>
      {files?.length ? (
        <ScrollArea className="h-fit w-full px-3">
          <div className="max-h-48 space-y-4">
            {files?.map((file, index) => (
              <FileCard
                key={index}
                file={file}
                name={`Image ${index + 1}`}
                progress={uploadProgress[index]}
                onRemove={() => onRemove(index)}
              />
            ))}
          </div>
        </ScrollArea>
      ) : null}
    </div>
  );
}

interface FileCardProps {
  file: string;
  name: string;
  progress?: number;
  onRemove: () => void;
}

function FileCard({ file, name, progress = 0, onRemove }: FileCardProps) {
  return (
    <div className="relative flex flex-col space-y-2">
      <div className="flex items-center space-x-4">
        <div className="flex flex-1 space-x-4">
          <img
            src={file}
            alt={`Uploaded image ${name}`}
            className="aspect-square shrink-0 rounded-md object-cover"
            width={48}
            height={48}
          />
          <div className="flex w-full flex-col justify-center gap-1">
            <div className="space-y-px">
              <p className="line-clamp-1 text-sm font-medium text-foreground/80">
                {name}
              </p>
              <p className="text-xs text-muted-foreground">
                {`${(file.length / 1024).toFixed(2)} KB`}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="size-7"
            onClick={onRemove}
          >
            <X className="size-4" aria-hidden="true" />
            <span className="sr-only">Remove file</span>
          </Button>
        </div>
      </div>
      {progress > 0 && progress < 100 && (
        <Progress value={progress} className="w-full" />
      )}
    </div>
  );
}