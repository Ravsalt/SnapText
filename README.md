# SnapText - Image to Text Extractor

SnapText is a modern web application that extracts text from images using OCR (Optical Character Recognition) technology. Built with Next.js, TypeScript, and Tailwind CSS, it provides a clean and intuitive interface for converting images to editable text.

## Features

- 🖼️ Upload images via drag & drop or file browser
- ✨ Modern, responsive UI with dark/light mode
- 📋 Copy extracted text to clipboard with one click
- 🚀 Serverless architecture for optimal performance
- 🔒 Secure API key handling

## Tech Stack

- **Frontend**: Next.js 14, React 19, TypeScript, Tailwind CSS
- **UI Components**: Radix UI, shadcn/ui
- **OCR**: OCR.space API
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- OCR.space API key (get it from [OCR.space](https://ocr.space/ocrapi/freekey))

### Local Development

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/snaptext.git
   cd snaptext
   ```

2. Install dependencies
   ```bash
   npm install
   # or
   yarn
   # or
   pnpm install
   ```

3. Create a `.env.local` file and add your environment variables:
   ```env
   OCR_SPACE_API_KEY=your_ocr_space_api_key_here
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Deployment

### Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyourusername%2Fsnaptext&env=OCR_SPACE_API_KEY&envDescription=API%20key%20for%20OCR.space%20service&envLink=https%3A%2F%2Focr.space%2Focrapi%2Ffreekey&project-name=snaptext&repository-name=snaptext)

1. Click the "Deploy" button above or:
   - Push your code to a GitHub/GitLab/Bitbucket repository
   - Import the repository to Vercel
   - Add your `OCR_SPACE_API_KEY` to the environment variables
   - Click "Deploy"

2. Your app will be live at `https://your-project-name.vercel.app`

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OCR_SPACE_API_KEY` | Your OCR.space API key | Yes |
| `NEXT_PUBLIC_APP_URL` | The base URL of your app (e.g., https://yourapp.vercel.app) | Yes |
| `NODE_ENV` | Environment (development/production) | No |

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
# SnapText
# SnapText
# SnapText
# SnapText
# SnapText
