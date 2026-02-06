import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Upload, FileText, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PdfUploadProps {
  onQuestionsExtracted: (questions: any[]) => void;
}

export function PdfUpload({ onQuestionsExtracted }: PdfUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [extractedCount, setExtractedCount] = useState(0);
  const [uploadMode, setUploadMode] = useState<'qa' | 'notes'>('qa');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast.error("Please upload a PDF file");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    setIsUploading(true);
    setUploadedFile(file.name);

    // helper to read file as base64
    const fileToBase64 = (f: File) => new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => {
        reader.abort();
        reject(new Error('Failed to read file'));
      };
      reader.onload = () => {
        const result = reader.result as string;
        const parts = result.split(',');
        resolve(parts.length > 1 ? parts[1] : parts[0]);
      };
      reader.readAsDataURL(f);
    });

    try {
      const base64 = await fileToBase64(file);

      // Call edge function to parse PDF. Ensure we send a string body.
      const { data, error } = await supabase.functions.invoke('parse-quiz-pdf', {
        body: JSON.stringify({ pdfBase64: base64, fileName: file.name, mode: uploadMode }),
        headers: { 'Content-Type': 'application/json' },
      } as any);

      if (error) {
        console.error('Function error:', error);
        throw error;
      }

      if (data?.questions && data.questions.length > 0) {
        setExtractedCount(data.questions.length);
        onQuestionsExtracted(data.questions);
        toast.success(`Generated/Extracted ${data.questions.length} questions from PDF!`);
      } else if (data?.success === false) {
        toast.error(data.error || 'Failed to extract questions from PDF');
        setUploadedFile(null);
      } else {
        toast.warning('No questions could be extracted/generated from the PDF');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to process PDF');
      setUploadedFile(null);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
          <FileText className="w-6 h-6 text-primary" />
        </div>
        <CardTitle className="text-lg">Upload Content</CardTitle>
        <CardDescription>
          Upload existing Q&A or generate a quiz from notes
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">

        {/* Mode Selector */}
        <div className="flex p-1 bg-muted rounded-lg">
          <button
            className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${uploadMode === 'qa' ? 'bg-background shadow' : 'text-muted-foreground hover:text-foreground'}`}
            onClick={() => setUploadMode('qa')}
            disabled={isUploading}
          >
            Existing Q&A
          </button>
          <button
            className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${uploadMode === 'notes' ? 'bg-background shadow' : 'text-muted-foreground hover:text-foreground'}`}
            onClick={() => setUploadMode('notes')}
            disabled={isUploading}
          >
            Generate from Notes
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={handleFileSelect}
          className="hidden"
        />

        {uploadedFile && extractedCount > 0 ? (
          <div className="flex items-center gap-3 p-4 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <div className="flex-1">
              <p className="font-medium text-green-800 dark:text-green-200">{uploadedFile}</p>
              <p className="text-sm text-green-600 dark:text-green-400">
                {extractedCount} questions ready
              </p>
            </div>
          </div>
        ) : uploadedFile && !isUploading ? (
          <div className="flex items-center gap-3 p-4 rounded-lg bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            <div className="flex-1">
              <p className="font-medium text-yellow-800 dark:text-yellow-200">{uploadedFile}</p>
              <p className="text-sm text-yellow-600 dark:text-yellow-400">
                No questions found
              </p>
            </div>
          </div>
        ) : null}

        <Button
          variant="outline"
          className="w-full h-24 border-dashed border-2 flex-col gap-2"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          {isUploading ? (
            <>
              <Loader2 className="w-8 h-8 animate-spin" />
              <span>{uploadMode === 'notes' ? 'Generating Questions...' : 'Extracting Questions...'}</span>
            </>
          ) : (
            <>
              <Upload className="w-8 h-8" />
              <span>Click to upload PDF</span>
            </>
          )}
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          {uploadMode === 'qa'
            ? "PDF should contain multiple choice questions."
            : "PDF should contain study notes or chapter content."}
        </p>
      </CardContent>
    </Card>
  );
}
