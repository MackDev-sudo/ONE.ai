import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ONE.ai',
  description:
    'OneAI is a versatile AI assistant designed to assist with a wide range of tasks, from answering questions to providing recommendations and engaging in casual conversation.',
  generator: 'Mackdev Inc',
  icons: {
    icon: '/xxx.png',
  },
  openGraph: {
    title: 'OneAI',
    siteName: 'oneai',
    url: 'https://mackdevinc.vercel.app/',
    description:
      'OneAI is a versatile AI chatbot designed to assist with a wide range of tasks, from answering questions to providing recommendations and engaging in casual conversation.',
    type: 'website',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'One AI Chatbot',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OneAI',
    description:
      'OneAI is a versatile AI chatbot designed to assist with a wide range of tasks, from answering questions to providing recommendations and engaging in casual conversation.',
    images: ['/og-image.jpg'],
  },
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>{children}</body>
    </html>
  )
}
