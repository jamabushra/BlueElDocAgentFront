"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { API_URL } from "@/lib/constants"
import { FileText, Upload, Loader2 } from "lucide-react"

export default function DocumentExtractionPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const { toast } = useToast()
  const [isUploading, setIsUploading] = useState(false)
  
  const onDrop = async (acceptedFiles: File[]) => {
    if (!session || !session.user) {
      toast({
        title: "Authentication error",
        description: "Please login again",
        variant: "destructive",
      })
      return
    }
    
    if (acceptedFiles.length === 0) {
      return
    }
    
    setIsUploading(true)
    
    try {
      const file = acceptedFiles[0]
      const formData = new FormData()
      formData.append("file", file)
      
      const response = await fetch(`${API_URL}/extract/document`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.user.token}`,
        },
        body: formData,
      })
      
      if (!response.ok) {
        throw new Error("Failed to upload document")
      }
      
      const data = await response.json()
      
      toast({
        title: "Document uploaded successfully",
        description: "Your document is being processed",
      })
      
      router.push(`/dashboard/history?task=${data.task_id}`)
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Please try again later",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
    },
    maxFiles: 1,
    disabled: isUploading,
  })
  
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Document Table Extraction</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Upload Document</CardTitle>
          <CardDescription>
            Upload a PDF, Word, or Excel file to extract tables
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors ${
              isDragActive
                ? "border-primary bg-primary/10"
                : "border-muted-foreground/25 hover:border-primary/50"
            }`}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center justify-center gap-4">
              {isUploading ? (
                <Loader2 className="h-10 w-10 text-muted-foreground animate-spin" />
              ) : (
                <Upload className="h-10 w-10 text-muted-foreground" />
              )}
              <div className="flex flex-col space-y-1 text-center">
                <p className="text-sm font-medium">
                  {isDragActive
                    ? "Drop the file here"
                    : "Drag and drop file here or click to browse"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Supported formats: PDF, DOCX, XLSX, XLS
                </p>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Maximum file size: 10MB
              </span>
            </div>
            <Button
              onClick={() => router.push("/dashboard/history")}
              variant="outline"
            >
              View History
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
} 