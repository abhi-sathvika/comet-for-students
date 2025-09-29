import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Comet Pro for Students - A/B Test',
  description: 'Unlock premium features designed for student success',
  keywords: 'comet, students, productivity, collaboration, study tools',
  authors: [{ name: 'Comet Team' }],
  openGraph: {
    title: 'Comet Pro for Students',
    description: 'Transform your studies with premium tools designed for students',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* Google Analytics placeholder - add your tracking ID */}
        {/*
        <script
          async
          src={`https://www.googletagmanager.com/gtag/js?id=YOUR_GA_TRACKING_ID`}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'YOUR_GA_TRACKING_ID');
            `,
          }}
        />
        */}
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}