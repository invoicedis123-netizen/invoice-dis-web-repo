import type { Metadata } from "next"
import { Inter, Poppins } from "next/font/google"
import "../styles/index.css"
import { AuthProvider } from "../contexts/AuthContext"
import { ThemeProvider } from "../lib/theme-provider"


const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const poppins = Poppins({
  weight: ['400', '500', '600', '700'],
  subsets: ["latin"],
  variable: "--font-poppins"
})


export const metadata: Metadata = {
  title: "TEVANI - Invoice Financing Platform",
  description: "India's leading invoice financing platform for MSMEs and startups",
}


export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${poppins.variable} min-h-screen bg-background antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}


// Made with Bob





