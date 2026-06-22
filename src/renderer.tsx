import { jsxRenderer } from 'hono/jsx-renderer'

export const renderer = jsxRenderer(({ children, title }) => {
  return (
    <html lang="id">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" type="image/svg+xml" href="/static/favicon.svg" />
        <title>{title || 'Merchant Adik — Kebutuhan Fish It'}</title>
        <meta name="description" content="Marketplace kebutuhan Fish It (Roblox): ikan secret, batu enchant, tumbal, rod, gems & coins. Bagian dari ekosistem SparkMind." />
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet" />
        <link href="/static/style.css" rel="stylesheet" />
      </head>
      <body class="ocean-bg text-slate-100 min-h-screen">
        {children}
      </body>
    </html>
  )
})
