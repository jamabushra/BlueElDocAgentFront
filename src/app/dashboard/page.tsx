import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Mail, History } from "lucide-react"
import Link from "next/link"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  
  const features = [
    {
      title: "Document Extraction",
      description: "Extract tables from PDF, Word, and Excel files",
      icon: FileText,
      href: "/dashboard/document",
    },
    {
      title: "Email Extraction",
      description: "Extract tables from emails and attachments",
      icon: Mail,
      href: "/dashboard/email",
    },
    {
      title: "Extraction History",
      description: "View your previous extractions",
      icon: History,
      href: "/dashboard/history",
    },
  ]
  
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Welcome, {session?.user?.name || "User"}</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => {
          const Icon = feature.icon
          return (
            <Link key={feature.href} href={feature.href}>
              <Card className="h-full cursor-pointer hover:bg-muted/50 transition-colors">
                <CardHeader>
                  <Icon className="h-8 w-8 mb-2 text-primary" />
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Click to get started
                  </p>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
} 