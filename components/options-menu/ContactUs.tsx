"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Mail,
  MapPin,
  Clock,
  Phone,
  MessageSquare,
  ExternalLink,
  Send,
  Shield,
  Users,
  Globe,
  AlertTriangle,
  Headphones
} from "lucide-react"

interface ContactUsProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  uiStyle?: "modern" | "pixel"
}

export function ContactUs({ open, onOpenChange, uiStyle = "modern" }: ContactUsProps) {
  const contactMethods = [
    {
      icon: Mail,
      title: "General Inquiries",
      description: "For questions, support, and general assistance",
      value: "mackdev1990@gmail.com",
      action: () => window.open('mailto:mackdev1990@gmail.com', '_blank')
    },
    {
      icon: Shield,
      title: "Grievance Support",
      description: "For complaints, concerns, and escalations",
      value: "grievance@mackdev.com",
      action: () => window.open('mailto:grievance@mackdev.com', '_blank')
    },
    {
      icon: Headphones,
      title: "Technical Support",
      description: "For technical issues and platform assistance",
      value: "support@mackdev.com",
      action: () => window.open('mailto:support@mackdev.com', '_blank')
    },
    {
      icon: Users,
      title: "Business Inquiries",
      description: "For partnerships and business opportunities",
      value: "business@mackdev.com",
      action: () => window.open('mailto:business@mackdev.com', '_blank')
    }
  ]

  const officeInfo = {
    address: "12/3 Sector 5, Park Street, Newtown",
    city: "Kolkata, West Bengal - 700156",
    country: "India",
    responseTime: "48 to 72 hours",
    availability: "Monday to Friday, 9:00 AM to 6:00 PM IST"
  }

  const supportChannels = [
    {
      icon: MessageSquare,
      title: "Live Chat",
      description: "Chat with our support team in real-time",
      available: "Coming Soon"
    },
    {
      icon: Globe,
      title: "Help Center",
      description: "Browse our comprehensive knowledge base",
      available: "24/7 Available"
    },
    {
      icon: Phone,
      title: "Phone Support",
      description: "Speak directly with our support specialists",
      available: "Business Hours"
    }
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`max-w-4xl max-h-[90vh] overflow-y-auto ${
        uiStyle === "pixel"
          ? "bg-gray-200 dark:bg-gray-800 border-4 border-gray-400 dark:border-gray-600 pixel-border rounded-none"
          : "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg"
      }`}>
        <DialogHeader className="space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <div className={`p-3 bg-gradient-to-br from-green-500 to-blue-600 ${
              uiStyle === "pixel" ? "pixel-border border-4 border-green-400" : "rounded-lg"
            }`}>
              <MessageSquare className="w-8 h-8 text-white" />
            </div>
            <div className="text-center">
              <DialogTitle className={`text-2xl font-bold text-gray-900 dark:text-gray-100 ${
                uiStyle === "pixel" ? "pixel-font" : ""
              }`}>
                {uiStyle === "pixel" ? "CONTACT US" : "Contact Us"}
              </DialogTitle>
              <p className={`text-sm text-gray-600 dark:text-gray-400 ${
                uiStyle === "pixel" ? "pixel-font" : ""
              }`}>
                We're here to help and answer any questions you might have
              </p>
            </div>
          </div>
          
          <div className="flex items-center justify-center">
            <Badge variant="outline" className={`text-green-600 border-green-300 ${
              uiStyle === "pixel" ? "pixel-font border-2" : ""
            }`}>
              Professional Support & Assistance
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Contact Methods */}
          <div>
            <h3 className={`text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 text-center ${
              uiStyle === "pixel" ? "pixel-font" : ""
            }`}>
              {uiStyle === "pixel" ? "GET IN TOUCH" : "Get in Touch"}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {contactMethods.map((method, index) => {
                const Icon = method.icon
                return (
                  <Card key={index} className={`cursor-pointer hover:shadow-lg transition-shadow ${
                    uiStyle === "pixel" ? "border-2" : ""
                  }`} onClick={method.action}>
                    <CardHeader className="pb-3">
                      <CardTitle className={`flex items-center gap-2 text-base ${
                        uiStyle === "pixel" ? "pixel-font" : ""
                      }`}>
                        <Icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        {method.title}
                      </CardTitle>
                      <CardDescription className={`text-sm ${
                        uiStyle === "pixel" ? "pixel-font text-xs" : ""
                      }`}>
                        {method.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <span className={`text-sm font-medium text-blue-600 dark:text-blue-400 ${
                          uiStyle === "pixel" ? "pixel-font text-xs" : ""
                        }`}>
                          {method.value}
                        </span>
                        <ExternalLink className="h-4 w-4 text-gray-400" />
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>

          <Separator />

          {/* Office Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className={uiStyle === "pixel" ? "border-2" : ""}>
              <CardHeader>
                <CardTitle className={`flex items-center gap-2 ${
                  uiStyle === "pixel" ? "pixel-font" : ""
                }`}>
                  <MapPin className="h-5 w-5 text-green-600 dark:text-green-400" />
                  {uiStyle === "pixel" ? "HEAD OFFICE" : "Head Office"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className={`text-sm text-gray-700 dark:text-gray-300 ${
                  uiStyle === "pixel" ? "pixel-font text-xs" : ""
                }`}>
                  <p className="font-medium">Mackdev Inc.</p>
                  <p>{officeInfo.address}</p>
                  <p>{officeInfo.city}</p>
                  <p>{officeInfo.country}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open('https://maps.google.com/?q=12/3+Sector+5,+Park+Street,+Newtown,+Kolkata,+WB+700156', '_blank')}
                  className={`mt-3 ${
                    uiStyle === "pixel" ? "pixel-font border-2" : ""
                  }`}
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  {uiStyle === "pixel" ? "VIEW ON MAP" : "View on Map"}
                  <ExternalLink className="w-3 h-3 ml-1" />
                </Button>
              </CardContent>
            </Card>

            <Card className={uiStyle === "pixel" ? "border-2" : ""}>
              <CardHeader>
                <CardTitle className={`flex items-center gap-2 ${
                  uiStyle === "pixel" ? "pixel-font" : ""
                }`}>
                  <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  {uiStyle === "pixel" ? "RESPONSE & HOURS" : "Response & Hours"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className={`text-sm text-gray-700 dark:text-gray-300 ${
                  uiStyle === "pixel" ? "pixel-font text-xs" : ""
                }`}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Response Time:</span>
                    <Badge variant="secondary" className={uiStyle === "pixel" ? "pixel-font border-2" : ""}>
                      {officeInfo.responseTime}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Business Hours:</span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {officeInfo.availability}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Separator />

          {/* Support Channels */}
          <div>
            <h3 className={`text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 text-center ${
              uiStyle === "pixel" ? "pixel-font" : ""
            }`}>
              {uiStyle === "pixel" ? "SUPPORT CHANNELS" : "Support Channels"}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {supportChannels.map((channel, index) => {
                const Icon = channel.icon
                return (
                  <div key={index} className={`text-center p-4 ${
                    uiStyle === "pixel"
                      ? "bg-gray-100 dark:bg-gray-700 border-2 border-gray-400 dark:border-gray-600"
                      : "bg-gray-50 dark:bg-gray-800/50 rounded-lg"
                  }`}>
                    <div className={`mx-auto w-12 h-12 bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-3 ${
                      uiStyle === "pixel" ? "border-2 border-blue-400 dark:border-blue-600" : "rounded-full"
                    }`}>
                      <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h4 className={`font-medium mb-2 text-gray-900 dark:text-gray-100 ${
                      uiStyle === "pixel" ? "pixel-font text-xs" : ""
                    }`}>
                      {channel.title}
                    </h4>
                    <p className={`text-xs text-gray-600 dark:text-gray-400 mb-2 ${
                      uiStyle === "pixel" ? "pixel-font" : ""
                    }`}>
                      {channel.description}
                    </p>
                    <Badge variant="outline" className={`text-xs ${
                      channel.available === "Coming Soon" ? "text-orange-600 border-orange-300" : "text-green-600 border-green-300"
                    } ${uiStyle === "pixel" ? "pixel-font border-2" : ""}`}>
                      {channel.available}
                    </Badge>
                  </div>
                )
              })}
            </div>
          </div>

          <Separator />

          {/* Important Notice */}
          <Card className={`border-amber-200 dark:border-amber-800 ${
            uiStyle === "pixel" ? "border-2" : ""
          }`}>
            <CardHeader>
              <CardTitle className={`flex items-center gap-2 text-amber-700 dark:text-amber-400 ${
                uiStyle === "pixel" ? "pixel-font" : ""
              }`}>
                <AlertTriangle className="h-5 w-5" />
                {uiStyle === "pixel" ? "IMPORTANT NOTICE" : "Important Notice"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className={`text-sm text-gray-700 dark:text-gray-300 ${
                uiStyle === "pixel" ? "pixel-font text-xs" : ""
              }`}>
                • Please allow up to <strong>48-72 hours</strong> for email responses during business days.
              </p>
              <p className={`text-sm text-gray-700 dark:text-gray-300 ${
                uiStyle === "pixel" ? "pixel-font text-xs" : ""
              }`}>
                • For urgent matters, please use our <strong>grievance email</strong> for faster escalation.
              </p>
              <p className={`text-sm text-gray-700 dark:text-gray-300 ${
                uiStyle === "pixel" ? "pixel-font text-xs" : ""
              }`}>
                • Include detailed information about your inquiry to help us assist you better.
              </p>
              <p className={`text-sm text-gray-700 dark:text-gray-300 ${
                uiStyle === "pixel" ? "pixel-font text-xs" : ""
              }`}>
                • Weekend and holiday messages will be addressed on the next business day.
              </p>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center space-y-3">
            <div className="flex items-center justify-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open('mailto:mackdev1990@gmail.com?subject=ONE.AI Inquiry', '_blank')}
                className={`${
                  uiStyle === "pixel" ? "pixel-font border-2" : ""
                }`}
              >
                <Send className="w-4 h-4 mr-2" />
                {uiStyle === "pixel" ? "SEND EMAIL" : "Send Email"}
                <ExternalLink className="w-3 h-3 ml-1" />
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open('https://github.com/MackDev-sudo', '_blank')}
                className={`${
                  uiStyle === "pixel" ? "pixel-font border-2" : ""
                }`}
              >
                <Globe className="w-4 h-4 mr-2" />
                {uiStyle === "pixel" ? "VISIT WEBSITE" : "Visit Website"}
                <ExternalLink className="w-3 h-3 ml-1" />
              </Button>
            </div>

            <div className="space-y-2">
              <p className={`text-xs text-gray-500 dark:text-gray-400 ${
                uiStyle === "pixel" ? "pixel-font" : ""
              }`}>
                We value your feedback and are committed to providing excellent support.
              </p>
              
              <p className={`text-xs text-gray-500 dark:text-gray-500 ${
                uiStyle === "pixel" ? "pixel-font" : ""
              }`}>
                © 2025 Mackdev Inc. All rights reserved. | Professional AI Solutions
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}