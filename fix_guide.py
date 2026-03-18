import re

with open("docs/user-guide.html", "r", encoding="utf-8") as f:
    html = f.read()

# 1. Google Fonts
if "fonts.googleapis.com" not in html:
    html = html.replace("<title>", "<link href=\"https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap\" rel=\"stylesheet\">\n  <title>")

# 2. Replace the CSS
new_css = """  <style>
    /* =============================================
       RESET & BASE (Tailwind-like approach)
    ============================================= */
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      /* Colors */
      --bg-body:     #f8fafc;
      --bg-surface:  #ffffff;
      --bg-surface-h:#f1f5f9;
      --text-main:   #1e293b;
      --text-muted:  #64748b;
      --text-light:  #94a3b8;
      --border-color:#e2e8f0;
      
      --primary:     #1d4ed8;
      --primary-d:   #1e3a8a;
      --accent:      #06b6d4;
      --success:     #10b981;
      --warning:     #f59e0b;
      --danger:      #ef4444;
      
      --header-bg:   #1e3a8a;
      --header-text: #ffffff;
      
      /* Layout & FX */
      --sidebar-w: 280px;
      --header-h:  72px;
      --radius-md: 0.75rem;
      --radius-lg: 1rem;
      --radius-xl: 1.5rem;
      --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
      --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
      --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
    }

    [data-theme="dark"] {
      --bg-body:     #0f172a;
      --bg-surface:  #1e293b;
      --bg-surface-h:#334155;
      --text-main:   #f8fafc;
      --text-muted:  #cbd5e1;
      --text-light:  #94a3b8;
      --border-color:#475569;
      
      --primary:     #3b82f6;
      --primary-d:   #60a5fa;
      
      --header-bg:   #0f172a;
      --header-text: #f8fafc;
      --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.4);
      --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.4);
    }

    html { font-size: 15px; scroll-behavior: smooth; }

    body {
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      background: var(--bg-body);
      color: var(--text-main);
      line-height: 1.6;
      transition: background 0.3s, color 0.3s;
    }

    a { color: var(--primary); text-decoration: none; transition: color 0.2s; }
    a:hover { color: var(--primary-d); text-decoration: underline; }

    /* =============================================
       HEADER
    ============================================= */
    header {
      position: fixed; top: 0; left: 0; right: 0;
      height: var(--header-h);
      background: var(--header-bg);
      color: var(--header-text);
      display: flex; align-items: center; justify-content: space-between;
      padding: 0 2rem;
      z-index: 200;
      box-shadow: var(--shadow-md);
      transition: background 0.3s;
    }

    .header-brand {
      display: flex; align-items: center; gap: 1rem;
      font-size: 1.15rem; font-weight: 700; letter-spacing: -0.3px;
    }

    .badge-version {
      background: rgba(255,255,255,0.15);
      padding: 4px 10px; border-radius: 999px;
      font-size: 0.75rem; font-weight: 600;
      backdrop-filter: blur(4px);
    }

    .header-actions { display: flex; align-items: center; gap: 1rem; }

    .btn-icon {
      background: rgba(255,255,255,0.1); color: var(--header-text);
      border: none; border-radius: 50%;
      width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;
      cursor: pointer; transition: all 0.2s;
    }
    .btn-icon:hover { background: rgba(255,255,255,0.2); transform: scale(1.05); }

    .btn-pdf {
      display: flex; align-items: center; gap: 0.5rem;
      background: var(--white); color: #1e3a8a;
      border: none; border-radius: var(--radius-md);
      padding: 0.6rem 1.2rem; font-size: 0.9rem; font-weight: 700;
      cursor: pointer; transition: all 0.2s; box-shadow: var(--shadow-sm);
    }
    .btn-pdf:hover { transform: translateY(-1px); box-shadow: var(--shadow-md); }

    /* =============================================
       SIDEBAR
    ============================================= */
    nav#sidebar {
      position: fixed; top: var(--header-h); left: 0;
      width: var(--sidebar-w); height: calc(100vh - var(--header-h));
      background: var(--bg-surface);
      border-right: 1px solid var(--border-color);
      overflow-y: auto; padding: 1.5rem 0;
      z-index: 150; transition: background 0.3s, border-color 0.3s;
    }

    nav#sidebar h2 {
      font-size: 0.75rem; font-weight: 700; letter-spacing: 1.2px;
      text-transform: uppercase; color: var(--text-light);
      padding: 0.75rem 1.5rem; margin-top: 1rem;
    }

    nav#sidebar a {
      display: flex; align-items: center; gap: 0.75rem;
      padding: 0.6rem 1.5rem;
      color: var(--text-muted); font-size: 0.95rem; font-weight: 500;
      border-left: 3px solid transparent;
      transition: all 0.2s;
    }
    nav#sidebar a:hover { background: var(--bg-surface-h); color: var(--primary); text-decoration: none; }
    nav#sidebar a.active {
      background: var(--bg-surface-h); color: var(--primary);
      border-left-color: var(--primary); font-weight: 700;
    }

    nav#sidebar .nav-icon { width: 18px; height: 18px; flex-shrink: 0; opacity: 0.8; }

    /* =============================================
       MAIN CONTENT
    ============================================= */
    main {
      margin-left: var(--sidebar-w);
      margin-top: var(--header-h);
      padding: 3rem 4rem;
      max-width: 1000px;
    }

    section { margin-bottom: 4rem; }
    section:first-of-type { margin-top: 0; }

    h1 { font-size: 2.2rem; font-weight: 800; color: var(--text-main); margin-bottom: 0.5rem; letter-spacing: -0.5px; }
    h2 { font-size: 1.5rem; font-weight: 700; color: var(--text-main); margin: 2.5rem 0 1rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.75rem; }
    h3 { font-size: 1.15rem; font-weight: 700; color: var(--primary-d); margin: 1.5rem 0 0.5rem; }

    .section-intro { color: var(--text-muted); font-size: 1rem; margin-bottom: 1.5rem; }
    .lead { font-size: 1.1rem; color: var(--text-muted); margin-bottom: 2rem; line-height: 1.7; }

    /* Steps */
    .steps { counter-reset: step; display: flex; flex-direction: column; gap: 1rem; margin: 1.5rem 0; }
    .step {
      counter-increment: step;
      display: flex; gap: 1.25rem;
      background: var(--bg-surface); border: 1px solid var(--border-color);
      border-radius: var(--radius-lg); padding: 1.25rem 1.5rem;
      box-shadow: var(--shadow-sm); transition: transform 0.2s, box-shadow 0.2s;
    }
    .step:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); }
    .step::before {
      content: counter(step);
      min-width: 36px; height: 36px; border-radius: 50%;
      background: var(--primary); color: #fff;
      display: flex; align-items: center; justify-content: center;
      font-weight: 700; font-size: 1rem; flex-shrink: 0;
      box-shadow: 0 0 0 4px var(--bg-surface-h);
    }
    .step-content strong { display: block; margin-bottom: 0.3rem; color: var(--text-main); font-size: 1.05rem; }
    .step-content p { font-size: 0.95rem; color: var(--text-muted); margin: 0; }

    /* Cards */
    .card-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 1.25rem; margin: 1.5rem 0; }
    .card {
      background: var(--bg-surface); border: 1px solid var(--border-color);
      border-radius: var(--radius-lg); padding: 1.5rem;
      box-shadow: var(--shadow-sm); transition: transform 0.2s, box-shadow 0.2s;
    }
    .card:hover { transform: translateY(-4px); box-shadow: var(--shadow-lg); }
    .card-title { font-weight: 700; color: var(--text-main); margin-bottom: 0.5rem; font-size: 1.05rem; }
    .card-body { font-size: 0.9rem; color: var(--text-muted); line-height: 1.5; }
    .card-icon { font-size: 2rem; margin-bottom: 1rem; }

    /* Callouts */
    .callout {
      border-radius: var(--radius-md); padding: 1rem 1.25rem;
      border-left: 4px solid; margin: 1.5rem 0;
      font-size: 0.95rem; line-height: 1.6;
    }
    .callout-info { background: rgba(59, 130, 246, 0.1); border-color: #3b82f6; color: var(--text-main); }
    .callout-warning { background: rgba(245, 158, 11, 0.1); border-color: var(--warning); color: var(--text-main); }
    .callout-success { background: rgba(16, 185, 129, 0.1); border-color: var(--success); color: var(--text-main); }
    .callout-danger { background: rgba(239, 68, 68, 0.1); border-color: var(--danger); color: var(--text-main); }
    .callout strong { font-weight: 700; color: inherit; }

    /* Tables */
    .table-wrap { overflow-x: auto; margin: 1.5rem 0; border-radius: var(--radius-lg); border: 1px solid var(--border-color); }
    table { width: 100%; border-collapse: collapse; font-size: 0.9rem; background: var(--bg-surface); }
    th { background: var(--bg-surface-h); color: var(--text-main); font-weight: 700; padding: 1rem; text-align: left; border-bottom: 2px solid var(--border-color); }
    td { padding: 1rem; border-bottom: 1px solid var(--border-color); color: var(--text-muted); }
    tr:last-child td { border-bottom: none; }
    tr:hover td { background: var(--bg-surface-h); }

    /* Tags / badges */
    .tag {
      display: inline-block; border-radius: 999px;
      padding: 4px 12px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;
    }
    .tag-green { background: rgba(22, 163, 74, 0.15); color: #16a34a; }
    .tag-yellow { background: rgba(217, 119, 6, 0.15); color: #d97706; }
    .tag-red { background: rgba(220, 38, 38, 0.15); color: #dc2626; }
    .tag-blue { background: rgba(37, 99, 235, 0.15); color: #2563eb; }
    .tag-gray { background: var(--bg-surface-h); color: var(--text-muted); }

    .num-list { list-style: decimal inside; padding-left: 0.5rem; }
    .num-list li { margin: 0.5rem 0; font-size: 0.95rem; color: var(--text-muted); }
    code { background: var(--bg-surface-h); border: 1px solid var(--border-color); border-radius: 6px; padding: 2px 6px; font-size: 0.85rem; font-family: ui-monospace, 'Menlo', monospace; color: var(--primary); }
    hr { border: none; border-top: 1px solid var(--border-color); margin: 2rem 0; }

    /* Hero section */
    .hero {
      background: linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%);
      color: #ffffff; border-radius: var(--radius-xl); padding: 3rem;
      margin-bottom: 3rem; box-shadow: var(--shadow-lg);
      position: relative; overflow: hidden;
    }
    .hero::after {
      content: ''; position: absolute; top: 0; right: 0; bottom: 0; left: 0;
      background: url('data:image/svg+xml;utf8,<svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><circle cx="20" cy="20" r="1" fill="rgba(255,255,255,0.05)"/></svg>');
      pointer-events: none;
    }
    .hero h1 { color: #ffffff; font-size: 2.5rem; letter-spacing: -1px; position: relative; z-index: 10; }
    .hero p { opacity: 0.85; max-width: 700px; margin-top: 1rem; font-size: 1.1rem; line-height: 1.6; position: relative; z-index: 10; color: #f8fafc; }

    .flow { display: flex; flex-wrap: wrap; gap: 0.75rem; align-items: center; margin: 1.5rem 0; }
    .flow-step {
      background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: 999px;
      padding: 0.6rem 1.25rem; font-size: 0.9rem; font-weight: 700; color: var(--text-main);
      box-shadow: var(--shadow-sm);
    }
    .flow-arrow { color: var(--text-light); font-size: 1.2rem; }

    .highlight { background: rgba(59, 130, 246, 0.1) !important; font-weight: 600; color: var(--primary) !important; }

    /* =============================================
       PRINT / PDF
    ============================================= */
    @media print {
      header, nav#sidebar, .btn-pdf, .btn-icon { display: none !important; }
      body { background: white; color: black; }
      main { margin: 0; padding: 1cm 1.5cm; max-width: 100%; }
      section { break-inside: avoid-page; }
      .hero { background: #1e3a8a !important; color: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .hero h1, .hero p { color: white !important; }
      .step { break-inside: avoid; border: 1px solid #e2e8f0; box-shadow: none; }
      .card { break-inside: avoid; border: 1px solid #e2e8f0; box-shadow: none; }
      a { color: inherit; text-decoration: none; }
      h1, h2, h3 { break-after: avoid; }
    }
  </style>"""

# Replace the style block
html = re.sub(r"<style>.*?</style>", new_css, html, flags=re.DOTALL)

# Add Dark Mode Toggle and restructure Header actions
old_pdf_btn = """  <button class="btn-pdf" onclick="window.print()">
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/>
    </svg>
    Exportar PDF
  </button>"""

new_header_actions = """  <div class="header-actions">
    <button class="btn-icon" onclick="toggleTheme()" aria-label="Alternar Tema" title="Alternar Modo Claro/Escuro">
      <!-- Lua icon (mostrado no modo claro, podemos simplificar usando condicional CSS, mas este SVG de lua/sol é padrão) -->
      <svg id="theme-icon" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
      </svg>
    </button>
    <button class="btn-pdf" onclick="window.print()">
      <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
        <path d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/>
      </svg>
      Gerar PDF
    </button>
  </div>"""

html = html.replace(old_pdf_btn, new_header_actions)

theme_script = """<script>
  function toggleTheme() {
    const html = document.documentElement;
    const current = html.getAttribute('data-theme');
    const newTheme = current === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
  }

  function updateThemeIcon(theme) {
    const icon = document.getElementById('theme-icon');
    if(icon) {
      if(theme === 'dark') {
        icon.innerHTML = '<circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>';
      } else {
        icon.innerHTML = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>';
      }
    }
  }

  // Initialize
  const savedTheme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', savedTheme);
  document.addEventListener('DOMContentLoaded', () => updateThemeIcon(savedTheme));
</script>
</body>"""

html = html.replace("</body>", theme_script)

# Write back
with open("docs/user-guide.html", "w", encoding="utf-8") as f:
    f.write(html)

print("HTML and CSS successfully updated!")
