

'use client';

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BarChart3, CheckCircle, FileText, Lock, Shield, Zap } from "lucide-react";
import { Button } from "../components/ui/button";
import { ThemeToggle } from "../components/ui/theme-toggle";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
<header className="border-b border-border relative">
  <div className="container flex h-16 items-center justify-between px-4 sm:px-8">
    {/* Left Section */}
    <div className="flex items-center gap-6">
      <div className="font-poppins text-xl font-bold text-primary">THEVANI</div>
      <nav className="hidden md:flex items-center gap-6">
        <Link href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground">Features</Link>
        <Link href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground">How It Works</Link>
        <Link href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground">Pricing</Link>
        <Link href="#testimonials" className="text-sm font-medium text-muted-foreground hover:text-foreground">Testimonials</Link>
      </nav>
    </div>

    {/* Right Section */}
    <div className="flex items-center gap-4 relative">
      <ThemeToggle />
      <Link href="/auth/login" className="text-sm font-medium text-muted-foreground hover:text-foreground">
        Sign In
      </Link>
      <Button asChild>
        <Link href="/auth/register">Get Started</Link>
      </Button>
    </div>
  </div>

  {/* Fixed Corner Logo */}
  <div className="absolute top-1/2 right-4 -translate-y-1/2">
    <Image
      src="/images/tevani-logo.png"
      alt="Tevani Logo Light"
      width={75}
      height={100}
      className="object-contain select-none"
    />
  </div>
</header>



      {/* Hero Section */}
<section className="bg-gradient-to-b from-background to-muted py-20 relative overflow-hidden">
  {/* Watermark Logo - Behind text, in front of right container */}
  <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none z-[5]">
    {/* Light Theme Logo */}
    <Image
      src="/images/tevani-logo.png"
      alt="Tevani Logo Light"
      width={850}
      height={400}
      className="object-contain select-none block dark:hidden"
    />
    {/* Dark Theme Logo */}
    <Image
      src="/images/dark-thevani-logo.png"
      alt="Tevani Logo Dark"
      width={850}
      height={400}
      className="object-contain select-none hidden dark:block"
    />
  </div>

  {/* Foreground Content */}
  <div className="container relative px-4 sm:px-8">
    <div className="flex flex-col lg:flex-row items-center gap-12">
      {/* Left Section - Higher z-index to appear above watermark */}
      <div className="flex-1 space-y-6 relative z-10">
        <div className="inline-flex items-center rounded-full border px-3 py-1 text-sm">
          <span className="mr-1 rounded-full bg-primary h-2 w-2"></span>
          <span className="text-muted-foreground">Launching October 2025</span>
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight">
          Invoice Financing <br />
          <span className="text-primary dark:text-yellow-400">Made Simple</span> for <br />
          MSMEs & Startups
        </h1>
        <p className="text-xl text-muted-foreground max-w-md">
          Unlock working capital trapped in your unpaid invoices. Get funded in 24 hours with our AI-powered platform.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button size="lg" asChild>
            <Link href="/auth/register?type=business">
              Register as Business
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/auth/register?type=investor">Register as Investor</Link>
          </Button>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center">
            <CheckCircle className="mr-1 h-4 w-4 text-primary" />
            No hidden fees
          </div>
          <div className="flex items-center">
            <CheckCircle className="mr-1 h-4 w-4 text-primary" />
            24-hour funding
          </div>
          <div className="flex items-center">
            <CheckCircle className="mr-1 h-4 w-4 text-primary" />
            Secure platform
          </div>
        </div>
      </div>

      {/* Right Section (Invoice Card) - Lower z-index to appear behind watermark */}
      <div className="flex-1 relative z-[1]">
        <div className="relative z-10 bg-card border rounded-lg shadow-xl p-6 max-w-md mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold">Invoice #INV-2025-001</h3>
              <p className="text-sm text-muted-foreground">Tech Solutions Ltd</p>
            </div>
            <div className="bg-primary/10 text-primary font-medium text-sm px-3 py-1 rounded-full dark:text-yellow-400">
              ₹125,000
            </div>
          </div>
          <div className="space-y-4">
            <div className="bg-muted h-2 rounded-full">
              <div className="bg-primary h-2 rounded-full w-3/4"></div>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Processing</span>
              <span className="font-medium">75% Complete</span>
            </div>
            <div className="border-t pt-4 mt-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Available for funding</span>
                <span className="font-medium">₹118,750</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-1">
                <span className="text-muted-foreground">Time to funding</span>
                <span className="font-medium">~8 hours</span>
              </div>
            </div>
            <Button className="w-full">Fund Now</Button>
          </div>
        </div>
        {/* <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-lg transform translate-x-4 translate-y-4 -z-10"></div> */}
      </div>
    </div>
  </div>
</section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="container px-4 sm:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Why Choose THEVANI</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our platform is designed specifically for MSMEs and startups to solve cash flow challenges through invoice financing.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-card border rounded-lg p-6">
              <div className="bg-primary/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Fast Funding</h3>
              <p className="text-muted-foreground">
                Get your invoices funded within 24 hours of approval, solving cash flow gaps quickly.
              </p>
            </div>
            <div className="bg-card border rounded-lg p-6">
              <div className="bg-primary/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Simple Process</h3>
              <p className="text-muted-foreground">
                Upload your invoice, get it validated, and receive funds directly to your bank account.
              </p>
            </div>
            <div className="bg-card border rounded-lg p-6">
              <div className="bg-primary/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure Platform</h3>
              <p className="text-muted-foreground">
                Advanced encryption and security measures to protect your business and financial data.
              </p>
            </div>
            <div className="bg-card border rounded-lg p-6">
              <div className="bg-primary/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Analytics Dashboard</h3>
              <p className="text-muted-foreground">
                Track your invoices, payments, and financing with our intuitive analytics dashboard.
              </p>
            </div>
            <div className="bg-card border rounded-lg p-6">
              <div className="bg-primary/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Lock className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">LegalBot</h3>
              <p className="text-muted-foreground">
                Automated consent management system ensures legal compliance and buyer verification.
              </p>
            </div>
            <div className="bg-card border rounded-lg p-6">
              <div className="bg-primary/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <CheckCircle className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No Hidden Fees</h3>
              <p className="text-muted-foreground">
                Transparent pricing with no hidden charges. Pay only for what you use.
              </p>
            </div>
          </div>
        </div>
      </section>


      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-muted">
        <div className="container px-4 sm:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Get your invoices funded in three simple steps
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-card border rounded-lg p-6 relative">
              <div className="absolute -top-4 -left-4 bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold mb-4">Upload Your Invoice</h3>
              <p className="text-muted-foreground mb-4">
                Upload your invoice through our platform. Our OCR technology will automatically extract key information.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center text-sm">
                  <CheckCircle className="mr-2 h-4 w-4 text-primary" />
                  Upload PDF or image files
                </li>
                <li className="flex items-center text-sm">
                  <CheckCircle className="mr-2 h-4 w-4 text-primary" />
                  Automatic data extraction
                </li>
                <li className="flex items-center text-sm">
                  <CheckCircle className="mr-2 h-4 w-4 text-primary" />
                  Verify extracted information
                </li>
              </ul>
            </div>
            <div className="bg-card border rounded-lg p-6 relative">
              <div className="absolute -top-4 -left-4 bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold mb-4">Get Validated</h3>
              <p className="text-muted-foreground mb-4">
                Our system validates your invoice and buyer. LegalBot manages the consent process with your buyer.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center text-sm">
                  <CheckCircle className="mr-2 h-4 w-4 text-primary" />
                  Automated validation checks
                </li>
                <li className="flex items-center text-sm">
                  <CheckCircle className="mr-2 h-4 w-4 text-primary" />
                  Buyer verification
                </li>
                <li className="flex items-center text-sm">
                  <CheckCircle className="mr-2 h-4 w-4 text-primary" />
                  Fraud detection
                </li>
              </ul>
            </div>
            <div className="bg-card border rounded-lg p-6 relative">
              <div className="absolute -top-4 -left-4 bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold mb-4">Receive Funding</h3>
              <p className="text-muted-foreground mb-4">
                Once validated, your invoice is funded and the money is transferred directly to your bank account.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center text-sm">
                  <CheckCircle className="mr-2 h-4 w-4 text-primary" />
                  Funding within 24 hours
                </li>
                <li className="flex items-center text-sm">
                  <CheckCircle className="mr-2 h-4 w-4 text-primary" />
                  Direct bank transfer
                </li>
                <li className="flex items-center text-sm">
                  <CheckCircle className="mr-2 h-4 w-4 text-primary" />
                  Track status in dashboard
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 text-center">
            <Button size="lg" asChild>
              <Link href="/auth/register">
                Get Started Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>


      {/* Pricing Section */}
      <section id="pricing" className="py-20">
        <div className="container px-4 sm:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              No hidden fees, no long-term commitments. Pay only for what you use.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-card border rounded-lg p-6">
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold mb-2">Basic</h3>
                <div className="text-4xl font-bold mb-2">1.5%</div>
                <p className="text-muted-foreground">per invoice</p>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center text-sm">
                  <CheckCircle className="mr-2 h-4 w-4 text-primary" />
                  Up to ₹10 lakh invoice value
                </li>
                <li className="flex items-center text-sm">
                  <CheckCircle className="mr-2 h-4 w-4 text-primary" />
                  48-hour funding
                </li>
                <li className="flex items-center text-sm">
                  <CheckCircle className="mr-2 h-4 w-4 text-primary" />
                  Basic validation
                </li>
                <li className="flex items-center text-sm">
                  <CheckCircle className="mr-2 h-4 w-4 text-primary" />
                  Email support
                </li>
              </ul>
              <Button variant="outline" className="w-full">Choose Basic</Button>
            </div>
            <div className="bg-card border-2 border-primary rounded-lg p-6 shadow-lg relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
                MOST POPULAR
              </div>
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold mb-2">Pro</h3>
                <div className="text-4xl font-bold mb-2">1.2%</div>
                <p className="text-muted-foreground">per invoice</p>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center text-sm">
                  <CheckCircle className="mr-2 h-4 w-4 text-primary" />
                  Up to ₹50 lakh invoice value
                </li>
                <li className="flex items-center text-sm">
                  <CheckCircle className="mr-2 h-4 w-4 text-primary" />
                  24-hour funding
                </li>
                <li className="flex items-center text-sm">
                  <CheckCircle className="mr-2 h-4 w-4 text-primary" />
                  Advanced validation
                </li>
                <li className="flex items-center text-sm">
                  <CheckCircle className="mr-2 h-4 w-4 text-primary" />
                  Priority support
                </li>
                <li className="flex items-center text-sm">
                  <CheckCircle className="mr-2 h-4 w-4 text-primary" />
                  Analytics dashboard
                </li>
              </ul>
              <Button className="w-full">Choose Pro</Button>
            </div>
            <div className="bg-card border rounded-lg p-6">
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold mb-2">Enterprise</h3>
                <div className="text-4xl font-bold mb-2">0.9%</div>
                <p className="text-muted-foreground">per invoice</p>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center text-sm">
                  <CheckCircle className="mr-2 h-4 w-4 text-primary" />
                  Unlimited invoice value
                </li>
                <li className="flex items-center text-sm">
                  <CheckCircle className="mr-2 h-4 w-4 text-primary" />
                  Same-day funding
                </li>
                <li className="flex items-center text-sm">
                  <CheckCircle className="mr-2 h-4 w-4 text-primary" />
                  Premium validation
                </li>
                <li className="flex items-center text-sm">
                  <CheckCircle className="mr-2 h-4 w-4 text-primary" />
                  Dedicated account manager
                </li>
                <li className="flex items-center text-sm">
                  <CheckCircle className="mr-2 h-4 w-4 text-primary" />
                  API integration
                </li>
                <li className="flex items-center text-sm">
                  <CheckCircle className="mr-2 h-4 w-4 text-primary" />
                  Custom reporting
                </li>
              </ul>
              <Button variant="outline" className="w-full">Contact Sales</Button>
            </div>
          </div>
        </div>
      </section>


      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-muted">
        <div className="container px-4 sm:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">What Our Customers Say</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Hear from businesses that have transformed their cash flow with THEVANI
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-card border rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg key={star} className="h-5 w-5 fill-primary" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-muted-foreground mb-4">
                "THEVANI has transformed our cash flow. We used to wait 60-90 days for payment, now we get funded within 24 hours. Game changer for our business growth."
              </p>
              <div>
                <p className="font-semibold">Rajesh Kumar</p>
                <p className="text-sm text-muted-foreground">CEO, TechSolutions India</p>
              </div>
            </div>
            <div className="bg-card border rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg key={star} className="h-5 w-5 fill-primary" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-muted-foreground mb-4">
                "The platform is incredibly easy to use. Upload an invoice, get it validated, and receive funds. The whole process is seamless and transparent."
              </p>
              <div>
                <p className="font-semibold">Priya Sharma</p>
                <p className="text-sm text-muted-foreground">Founder, GreenTech Startups</p>
              </div>
            </div>
            <div className="bg-card border rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg key={star} className="h-5 w-5 fill-primary" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-muted-foreground mb-4">
                "As a small manufacturing unit, cash flow was always a challenge. THEVANI has helped us maintain steady operations without worrying about delayed payments."
              </p>
              <div>
                <p className="font-semibold">Amit Patel</p>
                <p className="text-sm text-muted-foreground">Owner, Precision Parts Manufacturing</p>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container px-4 sm:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Cash Flow?</h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of MSMEs and startups who have unlocked their working capital with THEVANI.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/auth/register?type=business">
                  Register as Business
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10" asChild>
                <Link href="/auth/register?type=investor">Register as Investor</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>


      {/* Footer */}
<footer className="border-t border-border py-12">
  <div className="container px-4 sm:px-8">
    {/* Top Grid */}
    <div className="grid grid-cols-1 md:grid-cols-5 gap-8 items-start">
      {/* Column 1 - Brand + Socials */}
      <div>
        <div className="font-poppins text-xl font-bold text-primary mb-4">THEVANI</div>
        <p className="text-muted-foreground mb-4">
          Invoice financing platform for MSMEs and startups. Get funded in 24 hours.
        </p>
        <div className="flex items-center gap-4">
          {/* social icons */}
          <a href="#" className="text-muted-foreground hover:text-foreground">
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 4.557c-.883.392-1.832.656-2.828.775..." />
            </svg>
          </a>
          <a href="#" className="text-muted-foreground hover:text-foreground">
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012..." />
            </svg>
          </a>
          <a href="#" className="text-muted-foreground hover:text-foreground">
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M22.675 0h-21.35c-.732 0..." />
            </svg>
          </a>
          <a href="#" className="text-muted-foreground hover:text-foreground">
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19.615 3.184c-3.604-.246..." />
            </svg>
          </a>
        </div>
      </div>

      {/* Column 2 */}
      <div>
        <h3 className="font-semibold mb-4">Product</h3>
        <ul className="space-y-2">
          <li><a href="#features" className="text-muted-foreground hover:text-foreground">Features</a></li>
          <li><a href="#how-it-works" className="text-muted-foreground hover:text-foreground">How It Works</a></li>
          <li><a href="#pricing" className="text-muted-foreground hover:text-foreground">Pricing</a></li>
          <li><a href="#testimonials" className="text-muted-foreground hover:text-foreground">Testimonials</a></li>
        </ul>
      </div>

      {/* Column 3 */}
      <div>
        <h3 className="font-semibold mb-4">Company</h3>
        <ul className="space-y-2">
          <li><a href="#" className="text-muted-foreground hover:text-foreground">About Us</a></li>
          <li><a href="#" className="text-muted-foreground hover:text-foreground">Careers</a></li>
          <li><a href="#" className="text-muted-foreground hover:text-foreground">Blog</a></li>
          <li><a href="#" className="text-muted-foreground hover:text-foreground">Press</a></li>
        </ul>
      </div>

      {/* Column 4 - Legal */}
      <div>
        <h3 className="font-semibold mb-4">Legal</h3>
        <ul className="space-y-2">
          <li><a href="#" className="text-muted-foreground hover:text-foreground">Privacy Policy</a></li>
          <li><a href="#" className="text-muted-foreground hover:text-foreground">Terms of Service</a></li>
          <li><a href="#" className="text-muted-foreground hover:text-foreground">Cookie Policy</a></li>
          <li><a href="#" className="text-muted-foreground hover:text-foreground">Security</a></li>
        </ul>
      </div>

      {/* Column 5 - Logo */}
      <div className="flex justify-center md:justify-end items-center">
        <Image
          src="/images/registered-icon-no-bg.png"  // <-- replace with your new logo path
          alt="Thevani Logo"
          width={200}
          height={160}
          className="object-contain select-none"
        />
      </div>
    </div>

    {/* Bottom Line */}
    <div className="border-t border-border mt-12 pt-8 text-center text-sm text-muted-foreground">
      <p>&copy; {new Date().getFullYear()} THEVANI. All rights reserved.</p>
    </div>
  </div>
</footer>

    </div>
  );
}