# React Grab Opener

Open React component files directly from your browser using the [react-grab](https://github.com/aidenybai/react-grab) npm package

## Features

✨ **Instant Component Navigation**: Click on any React element in your browser, press `Alt+V` in VS Code, and jump straight to the source code.

🎯 **Multiple Selection Support**: Select multiple elements in the browser (Ctrl+Click) and open all their files at once.

🔍 **Smart File Resolution**: Automatically finds component files in your workspace, even with complex project structures.

📍 **Definition Navigation**: Jumps directly to the component definition in the opened file.

## How It Works

1. **Select React elements** in your browser (hover and press Ctrl+C/Cmd+C)
2. **Press `Alt+V`** in VS Code
3. **Files open automatically** with cursor at the component definition

## Usage Example

### Single Element

Select a button in your app:

```
<button>Click me</button> in Header.tsx
```

Press `Alt+V` → Opens `Header.tsx` with cursor at the `Header` component.

### Multiple Elements

Select multiple elements:

- `CatalogButton` component
- `SearchBar` component
- `NavLink` component

Press `Alt+V` → Opens all 3 files in separate tabs.

## Keyboard Shortcut

- **Windows/Linux**: `Alt+V`
- **macOS**: `Alt+V`

You can customize this in VS Code keyboard shortcuts (search for "Open React Components from Clipboard").

## Requirements

- **VS Code**: 1.108.1 or later
- **Project Setup**: React project using Next.js, Vite, or Webpack
- **[react-grab](https://github.com/aidenybai/react-grab)**: initialized in your project (see installation steps)

## Supported File Types

- `.tsx` (TypeScript React)
- `.ts` (TypeScript)
- `.jsx` (JavaScript React)
- `.js` (JavaScript)

## How to Install

1. Install from VS Code Marketplace (search "React Grab Opener")
2. Install React Grab into your React project. Run this command at project root (where your `next.config.ts`, `vite.config.ts`, or similar config file is located):
   ```bash
   npx -y grab@latest init
   ```
   This automatically installs react-grab and sets it up for your project.

## Manual Installation

If automatic setup doesn't work or you prefer manual configuration:

### Next.js (App Router)
Add this to your `app/layout.tsx`:
```tsx
import Script from "next/script";

export default function RootLayout({ children }) {
  return (
    <html>
      <head>
        {process.env.NODE_ENV === "development" && (
          <Script
            src="//unpkg.com/react-grab/dist/index.global.js"
            crossOrigin="anonymous"
            strategy="beforeInteractive"
          />
        )}
      </head>
      <body>{children}</body>
    </html>
  );
}
```

### Next.js (Pages Router)
Add this to your `pages/_document.tsx`:
```tsx
import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {process.env.NODE_ENV === "development" && (
          <Script
            src="//unpkg.com/react-grab/dist/index.global.js"
            crossOrigin="anonymous"
            strategy="beforeInteractive"
          />
        )}
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
```

### Vite
Add this to your `index.html`:
```html
<!doctype html>
<html lang="en">
  <head>
    <script type="module">
      if (import.meta.env.DEV) {
        import("react-grab");
      }
    </script>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

### Webpack
First install:
```bash
npm install react-grab
```

Then add this at the top of your main entry file (e.g., `src/index.tsx` or `src/main.tsx`):
```tsx
if (process.env.NODE_ENV === "development") {
  import("react-grab");
}
```

## Usage

Once react-grab is installed in your project, hover over any UI element in your browser and press:

- **Mac**: ⌘C (Cmd+C)
- **Windows/Linux**: Ctrl+C

This copies the element's context (file name, React component, and HTML source code) to your clipboard. For example:

```
<a class="ml-auto inline-block text-sm" href="#">
  Forgot your password?
</a>
in LoginForm at components/login-form.tsx:46:19
```

Then press `Alt+V` in VS Code to open the file and navigate to the component definition.

## Troubleshooting

### "No valid React components found"

- Make sure react-grab is properly installed and running in development mode
- Check that you've hovered over and copied an element using Ctrl+C/Cmd+C
- Ensure you're in development mode (not production build)

### "Could not find file"

- Ensure the file exists in your VS Code workspace
- Try opening the workspace folder that contains the file
- Check that the file path matches your project structure

### Component definition not found

- The file opens but the cursor doesn't move to the component
- This can happen with default exports or unusual component naming
- The file is still opened correctly

## Release Notes

See [CHANGELOG.md](CHANGELOG.md) for detailed release notes.

## License

MIT

## Credits

Built to work seamlessly with [react-grab](https://github.com/aidenybai/react-grab) by [aidenybai](https://github.com/aidenybai).
