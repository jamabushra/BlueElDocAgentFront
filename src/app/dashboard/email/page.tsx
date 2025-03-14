"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { API_URL } from "@/lib/constants"
import { Mail, Loader2 } from "lucide-react"

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
  imap_server: z.string().min(1, { message: "IMAP server is required" }),
  limit: z.coerce.number().int().min(1).max(100),
  criteria: z.string().min(1, { message: "Search criteria is required" }),
})

type FormValues = z.infer<typeof formSchema>

export default function EmailExtractionPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      imap_server: "imap.gmail.com",
      limit: 20,
      criteria: "ALL",
    },
  })
  
  const onSubmit = async (values: FormValues) => {
    if (!session || !session.user) {
      toast({
        title: "Authentication error",
        description: "Please login again",
        variant: "destructive",
      })
      return
    }
    
    setIsSubmitting(true)
    
    try {
      const response = await fetch(`${API_URL}/extract/email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.user.token}`,
        },
        body: JSON.stringify(values),
      })
      
      if (!response.ok) {
        throw new Error("Failed to process email extraction")
      }
      
      const data = await response.json()
      
      toast({
        title: "Email extraction started",
        description: "Your emails are being processed",
      })
      
      router.push(`/dashboard/history?task=${data.task_id}`)
    } catch (error) {
      toast({
        title: "Extraction failed",
        description: error instanceof Error ? error.message : "Please try again later",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Email Table Extraction</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Email Credentials</CardTitle>
          <CardDescription>
            Enter your email credentials to extract tables from emails
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="name@example.com" {...field} />
                    </FormControl>
                    <FormDescription>
                      Your email address
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormDescription>
                      For Gmail, use an app password if you have 2FA enabled
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="imap_server"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>IMAP Server</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select IMAP server" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="imap.gmail.com">Gmail (imap.gmail.com)</SelectItem>
                        <SelectItem value="outlook.office365.com">Outlook (outlook.office365.com)</SelectItem>
                        <SelectItem value="imap.mail.yahoo.com">Yahoo (imap.mail.yahoo.com)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Select your email provider
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="limit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Limit</FormLabel>
                      <FormControl>
                        <Input type="number" min={1} max={100} {...field} />
                      </FormControl>
                      <FormDescription>
                        Maximum number of emails to process
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="criteria"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Search Criteria</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select search criteria" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="ALL">All emails</SelectItem>
                          <SelectItem value="UNSEEN">Unread emails</SelectItem>
                          <SelectItem value="SEEN">Read emails</SelectItem>
                          <SelectItem value="FLAGGED">Flagged emails</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Filter emails by criteria
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/dashboard/history")}
              >
                View History
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Extract Tables
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  )
} 