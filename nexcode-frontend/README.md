# NexCode Frontend

The frontend application for NexCode - A modern online judge platform for competitive programming and coding education.

## 🚀 Features

- **Modern UI**: Built with React 18, TypeScript, and Tailwind CSS
- **Code Editor**: Monaco Editor integration for syntax highlighting
- **Real-time Results**: Instant feedback on code submissions
- **AI Assistant**: Intelligent coding help with context-aware guidance
- **Contest System**: Participate in programming contests
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Dark/Light Mode**: Theme support with next-themes

## 🛠️ Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/ui** - Beautiful component library
- **Monaco Editor** - Code editor with syntax highlighting
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **React Query** - Data fetching and caching
- **React Hook Form** - Form handling
- **Zod** - Schema validation

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/nexcode-frontend.git
cd nexcode-frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:3000`

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── layout/         # Layout components (Header, Layout)
│   ├── problem/        # Problem-related components
│   └── ui/             # Shadcn/ui components
├── pages/              # Page components
├── hooks/              # Custom React hooks
├── lib/                # Utilities and API configuration
└── main.tsx           # Application entry point
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## 🌐 Environment Variables

Create a `.env.local` file in the root directory:

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

For production, set the environment variable in your deployment platform (Vercel):

```env
VITE_API_BASE_URL=https://your-backend-url.onrender.com/api
```

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect to Vercel**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository

2. **Configure Project**
   - **Framework Preset**: `Vite`
   - **Root Directory**: `/` (root of repository)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

3. **Environment Variables**
   - Add `VITE_API_BASE_URL` with your backend API URL

4. **Deploy**

### Other Platforms

The application can be deployed to any static hosting platform:
- Netlify
- GitHub Pages
- AWS S3 + CloudFront
- Firebase Hosting

## 🔗 API Integration

The frontend communicates with the NexCode backend API. Make sure your backend is running and accessible at the URL specified in `VITE_API_BASE_URL`.

### API Endpoints

- **Authentication**: `/api/users/`
- **Problems**: `/api/problems/`
- **Submissions**: `/api/submissions/`
- **Contests**: `/api/contests/`
- **AI Assistant**: `/api/ai-assistant/`

## 🎨 UI Components

This project uses [Shadcn/ui](https://ui.shadcn.com/) components. To add new components:

```bash
npx shadcn@latest add [component-name]
```

## 🔧 Development

### Adding New Pages

1. Create a new component in `src/pages/`
2. Add the route in `src/App.tsx`
3. Update navigation if needed

### Styling

- Use Tailwind CSS classes for styling
- Follow the existing design patterns
- Use the theme variables for consistent colors

### State Management

- Use React Query for server state
- Use React hooks for local state
- Consider Zustand for complex client state if needed

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🔗 Related Repositories

- [NexCode Backend](https://github.com/yourusername/nexcode-backend) - Django backend API
- [NexCode](https://github.com/yourusername/nexcode) - Main repository

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the code examples
