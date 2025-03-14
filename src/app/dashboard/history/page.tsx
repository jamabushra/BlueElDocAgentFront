"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { API_URL } from "@/lib/constants"
import { FileText, Mail, Clock, CheckCircle, XCircle, Loader2, Download } from "lucide-react"
import { DataTable } from "@/components/dashboard/data-table"

interface Task {
  task_id: string
  user_email: string
  status: string
  created_at: string
  completed_at: string | null
  file_type: string
  file_name: string
  tables_extracted: number
  result_files: string[]
}

interface TableData {
  [key: string]: any
}

export default function HistoryPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  const { toast } = useToast()
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [selectedFileIndex, setSelectedFileIndex] = useState<number | null>(null)
  const [tableData, setTableData] = useState<TableData[]>([])
  const [isLoadingPreview, setIsLoadingPreview] = useState(false)
  
  const taskIdFromUrl = searchParams.get("task")
  
  useEffect(() => {
    if (!session || !session.user) return
    
    const fetchTasks = async () => {
      try {
        const response = await fetch(`${API_URL}/tasks`, {
          headers: {
            Authorization: `Bearer ${session.user.token}`,
          },
        })
        
        if (!response.ok) {
          throw new Error("Failed to fetch tasks")
        }
        
        const data = await response.json()
        setTasks(data)
        
        // If task ID is in URL, select that task
        if (taskIdFromUrl) {
          const task = data.find((t: Task) => t.task_id === taskIdFromUrl)
          if (task) {
            setSelectedTask(task)
          }
        }
      } catch (error) {
        toast({
          title: "Error fetching history",
          description: error instanceof Error ? error.message : "Please try again later",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchTasks()
    
    // Poll for updates every 5 seconds if there are processing tasks
    const interval = setInterval(() => {
      if (tasks.some(task => task.status === "processing")) {
        fetchTasks()
      }
    }, 5000)
    
    return () => clearInterval(interval)
  }, [session, toast, taskIdFromUrl])
  
  const fetchTablePreview = async (task: Task, fileIndex: number) => {
    if (!session || !session.user) return
    
    setIsLoadingPreview(true)
    setSelectedTask(task)
    setSelectedFileIndex(fileIndex)
    
    try {
      const response = await fetch(`${API_URL}/preview/${task.task_id}/${fileIndex}`, {
        headers: {
          Authorization: `Bearer ${session.user.token}`,
        },
      })
      
      if (!response.ok) {
        throw new Error("Failed to fetch table preview")
      }
      
      const data = await response.json()
      
      // If it's a JSON with metadata and data, extract just the data
      if (data.metadata && data.data) {
        setTableData(data.data)
      } else {
        setTableData(data)
      }
    } catch (error) {
      toast({
        title: "Error fetching preview",
        description: error instanceof Error ? error.message : "Please try again later",
        variant: "destructive",
      })
    } finally {
      setIsLoadingPreview(false)
    }
  }
  
  const getTaskIcon = (task: Task) => {
    if (task.file_type === "document") {
      return <FileText className="h-5 w-5" />
    } else {
      return <Mail className="h-5 w-5" />
    }
  }
  
  const getStatusIcon = (status: string) => {
    if (status === "completed") {
      return <CheckCircle className="h-5 w-5 text-green-500" />
    } else if (status === "processing") {
      return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
    } else {
      return <XCircle className="h-5 w-5 text-red-500" />
    }
  }
  
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "PPp")
    } catch (error) {
      return dateString
    }
  }
  
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Extraction History</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Recent Extractions</CardTitle>
              <CardDescription>
                Your recent table extractions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : tasks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No extractions found</p>
                  <div className="mt-4 flex gap-4 justify-center">
                    <Button
                      variant="outline"
                      onClick={() => router.push("/dashboard/document")}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Extract from Document
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => router.push("/dashboard/email")}
                    >
                      <Mail className="mr-2 h-4 w-4" />
                      Extract from Email
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {tasks.map((task) => (
                    <div
                      key={task.task_id}
                      className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                        selectedTask?.task_id === task.task_id
                          ? "bg-muted border-primary"
                          : "hover:bg-muted/50"
                      }`}
                      onClick={() => {
                        setSelectedTask(task)
                        if (task.result_files.length > 0) {
                          fetchTablePreview(task, 0)
                        } else {
                          setSelectedFileIndex(null)
                          setTableData([])
                        }
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getTaskIcon(task)}
                          <div>
                            <p className="font-medium truncate max-w-[180px]">
                              {task.file_name}
                            </p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDate(task.created_at)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(task.status)}
                          <span className="text-xs capitalize">{task.status}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-2">
          {selectedTask ? (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {getTaskIcon(selectedTask)}
                      {selectedTask.file_name}
                    </CardTitle>
                    <CardDescription>
                      {selectedTask.tables_extracted} tables extracted
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(selectedTask.status)}
                    <span className="text-sm capitalize">{selectedTask.status}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {selectedTask.status === "processing" ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                    <p className="text-lg font-medium">Processing your extraction</p>
                    <p className="text-muted-foreground">This may take a few moments...</p>
                  </div>
                ) : selectedTask.status === "failed" ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <XCircle className="h-12 w-12 text-destructive mb-4" />
                    <p className="text-lg font-medium">Extraction failed</p>
                    <p className="text-muted-foreground">Please try again</p>
                    <div className="mt-6">
                      <Button
                        variant="outline"
                        onClick={() => router.push(
                          selectedTask.file_type === "document"
                            ? "/dashboard/document"
                            : "/dashboard/email"
                        )}
                      >
                        Try Again
                      </Button>
                    </div>
                  </div>
                ) : selectedTask.tables_extracted === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <p className="text-lg font-medium">No tables found</p>
                    <p className="text-muted-foreground">No tables were found in this extraction</p>
                    <div className="mt-6">
                      <Button
                        variant="outline"
                        onClick={() => router.push(
                          selectedTask.file_type === "document"
                            ? "/dashboard/document"
                            : "/dashboard/email"
                        )}
                      >
                        Try Another File
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="mb-6">
                      <Tabs defaultValue="preview" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="preview">Preview</TabsTrigger>
                          <TabsTrigger value="download">Download</TabsTrigger>
                        </TabsList>
                        <TabsContent value="preview" className="pt-4">
                          {selectedTask.result_files.length > 0 && (
                            <div className="mb-4">
                              <p className="text-sm font-medium mb-2">Select a table:</p>
                              <div className="flex flex-wrap gap-2">
                                {selectedTask.result_files.map((file, index) => {
                                  // Only show JSON files in the preview tab
                                  if (!file.endsWith('.json')) return null
                                  
                                  const fileName = file.split('/').pop() || `Table ${index + 1}`
                                  
                                  return (
                                    <Button
                                      key={index}
                                      variant={selectedFileIndex === index ? "default" : "outline"}
                                      size="sm"
                                      onClick={() => fetchTablePreview(selectedTask, index)}
                                    >
                                      {`Table ${index + 1}`}
                                    </Button>
                                  )
                                })}
                              </div>
                            </div>
                          )}
                          
                          {isLoadingPreview ? (
                            <div className="flex justify-center py-8">
                              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            </div>
                          ) : tableData.length > 0 ? (
                            <div className="border rounded-md overflow-hidden">
                              <DataTable data={tableData} />
                            </div>
                          ) : (
                            <div className="text-center py-8 text-muted-foreground">
                              <p>Select a table to preview</p>
                            </div>
                          )}
                        </TabsContent>
                        <TabsContent value="download" className="pt-4">
                          <div className="space-y-4">
                            <p className="text-sm font-medium">Download options:</p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <Card>
                                <CardHeader className="pb-2">
                                  <CardTitle className="text-lg">CSV Files</CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <div className="space-y-2">
                                    {selectedTask.result_files
                                      .filter(file => file.endsWith('.csv'))
                                      .map((file, index) => {
                                        const fileName = file.split('/').pop() || `Table ${index + 1}.csv`
                                        
                                        return (
                                          <div key={index} className="flex justify-between items-center">
                                            <span className="text-sm truncate max-w-[200px]">
                                              {fileName}
                                            </span>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => window.open(`${API_URL}${file}`, '_blank')}
                                            >
                                              <Download className="h-4 w-4" />
                                            </Button>
                                          </div>
                                        )
                                      })}
                                  </div>
                                </CardContent>
                              </Card>
                              
                              <Card>
                                <CardHeader className="pb-2">
                                  <CardTitle className="text-lg">JSON Files</CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <div className="space-y-2">
                                    {selectedTask.result_files
                                      .filter(file => file.endsWith('.json'))
                                      .map((file, index) => {
                                        const fileName = file.split('/').pop() || `Table ${index + 1}.json`
                                        
                                        return (
                                          <div key={index} className="flex justify-between items-center">
                                            <span className="text-sm truncate max-w-[200px]">
                                              {fileName}
                                            </span>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => window.open(`${API_URL}${file}`, '_blank')}
                                            >
                                              <Download className="h-4 w-4" />
                                            </Button>
                                          </div>
                                        )
                                      })}
                                  </div>
                                </CardContent>
                              </Card>
                            </div>
                          </div>
                        </TabsContent>
                      </Tabs>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] border rounded-lg p-8">
              <p className="text-xl font-medium mb-2">Select an extraction</p>
              <p className="text-muted-foreground text-center mb-6">
                Select an extraction from the list to view details and preview tables
              </p>
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={() => router.push("/dashboard/document")}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Extract from Document
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push("/dashboard/email")}
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Extract from Email
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 