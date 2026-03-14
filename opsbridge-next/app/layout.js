import "./globals.css";

export const metadata = {
  title: "OpsBridge — 工厂任务管理",
  description: "Factory floor task management for Chinese-speaking workers",
};

export default function RootLayout({ children }) {
  return (
    // lang="zh-CN" tells the browser this is a Simplified Chinese app.
    // This improves font rendering and screen-reader pronunciation.
    <html lang="zh-CN">
      <head>
        {/*
          Noto Sans SC — the best free font for Simplified Chinese on the web.
          Loaded via Google Fonts CDN. Workers' devices will cache this after
          the first visit, so it loads instantly on repeat visits.
        */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
