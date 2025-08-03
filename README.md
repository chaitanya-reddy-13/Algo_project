# NexCode - Online Judge Platform

A modern online judge platform built with Django, React, and AI assistance for competitive programming and coding education.

## 🚀 Features

- **Problem Management**: Create and manage coding problems with test cases  
- **Code Execution**: Secure code evaluation with multiple language support  
- **AI Assistant**: Intelligent coding help with context-aware guidance  
- **Contest System**: Organize programming contests with leaderboards  
- **User Management**: User registration, authentication, and profiles  
- **Admin Dashboard**: Comprehensive admin interface for platform management  
- **Real-time Results**: Instant feedback on code submissions  

## 🛠️ Tech Stack

### Backend
- **Django 4.2** - Web framework  
- **Django REST Framework** - API development  
- **PostgreSQL** - Database (production)  
- **SQLite** - Database (development)  
- **Gunicorn** - WSGI server  
- **JWT Authentication** - Secure user authentication  

### Frontend
- **React 18** - UI framework  
- **TypeScript** - Type safety  
- **Vite** - Build tool  
- **Tailwind CSS** - Styling  
- **Shadcn/ui** - Component library  
- **Monaco Editor** - Code editor  

### AI Integration
- **OpenAI GPT** - AI assistance  
- **Anthropic Claude** - Alternative AI provider  
- **Google Gemini** - Additional AI option  

## 🚀 Deployment

### Backend Deployment (Render)

1. **Create a new Web Service on Render**
   - Connect your GitHub repository  
   - Set the following environment variables:
     ```
     SECRET_KEY=your-secret-key-here
     DEBUG=False
     ALLOWED_HOSTS=your-app-name.onrender.com
     CORS_ALLOWED_ORIGINS=https://NexCode.vercel.app
     OPENAI_API_KEY=your-openai-key (optional)
     ANTHROPIC_API_KEY=your-anthropic-key (optional)
     GOOGLE_AI_API_KEY=your-google-ai-key (optional)
     ```
   - Build Command:
     ```
     cd backend && chmod +x build.sh && ./build.sh
     ```
   - Start Command:
     ```
     cd backend && gunicorn --bind 0.0.0.0:$PORT onlinejudge.wsgi:application
     ```

2. **Add PostgreSQL Database**
   - Create a new PostgreSQL database on Render  
   - Add the `DATABASE_URL` environment variable to your web service  

### Frontend Deployment (Vercel)

1. **Deploy to Vercel**
   - Connect your GitHub repository to Vercel  
   - Set the following environment variable:
     ```
     VITE_API_BASE_URL=https://your-backend-app-name.onrender.com/api
     ```
   - Deploy the `frontend` directory  

2. **Custom Domain (Optional)**
   - Configure your custom domain in Vercel settings  

## 🐍 Local Development

### Prerequisites
- Python 3.8+  
- Node.js 16+  
- Git  

### Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Load sample data
python manage.py load_sample_data

# Run development server
python manage.py runserver
```

### Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

## 📁 Project Structure

```
NexCode/
├── backend/                 # Django backend
│   ├── core/               # Core app (users, auth)
│   ├── problems/           # Problem management
│   ├── submissions/        # Code submission & evaluation
│   ├── contests/           # Contest system
│   ├── ai_assistant/       # AI integration
│   ├── sample_data/        # Sample data management
│   ├── build.sh           # Render build script
│   └── requirements.txt   # Python dependencies
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom hooks
│   │   └── lib/            # Utilities and API
│   ├── public/             # Static assets
│   ├── vercel.json        # Vercel configuration
│   └── package.json       # Node dependencies
└── README.md              # This file
```

## 🔐 Environment Variables

### Backend (Render)
```env
SECRET_KEY=your-secret-key-here
DEBUG=False
ALLOWED_HOSTS=your-app-name.onrender.com
CORS_ALLOWED_ORIGINS=https://NexCode.vercel.app
DATABASE_URL=postgresql://...
OPENAI_API_KEY=your-openai-key
ANTHROPIC_API_KEY=your-anthropic-key
GOOGLE_AI_API_KEY=your-google-ai-key
```

### Frontend (Vercel)
```env
VITE_API_BASE_URL=https://your-backend-app-name.onrender.com/api
```

## 🎯 Supported Programming Languages

- **Python** - Full support with test cases  
- **C++** - Compilation and execution  
- **Java** - Compilation and execution  
- **JavaScript** - Node.js execution  
- **C** - Compilation and execution  
- **Go** - Compilation and execution  
- **Rust** - Compilation and execution  

## 🤖 AI Assistant Features

- **Context-Aware Help**: Understands problem requirements and user code  
- **Educational Guidance**: Provides hints without complete solutions  
- **Algorithm Explanation**: Explains concepts and approaches  
- **Debugging Support**: Helps identify code issues  
- **Multi-Provider Support**: OpenAI, Anthropic, and Google AI  

## 🏆 Contest System

- **Contest Creation**: Admin can create programming contests  
- **Registration**: Users can register for contests  
- **Problem Assignment**: Multiple problems per contest  
- **Scoring System**: Points-based scoring with tie-breaking  
- **Leaderboards**: Real-time rankings and statistics  
- **Submission Tracking**: Contest-specific submission history  

## 📊 Admin Features

- **Problem Management**: Add, edit, delete problems and test cases  
- **User Management**: View and manage user accounts  
- **Contest Management**: Create and manage contests  
- **Statistics Dashboard**: Platform usage analytics  
- **Submission Monitoring**: View all user submissions  

## 🔧 Development Commands

### Backend
```bash
# Run tests
python manage.py test

# Create migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Load sample data
python manage.py load_sample_data

# Create superuser
python manage.py createsuperuser
```

### Frontend
```bash
# Run tests
npm test

# Build for production
npm run build

# Lint code
npm run lint

# Type check
npm run type-check
```

## 🤝 Contributing

1. Fork the repository  
2. Create a feature branch  
3. Make your changes  
4. Add tests if applicable  
5. Submit a pull request  

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository  
- Check the documentation  
- Review the code examples  

## 🎉 Acknowledgments

- Django and React communities  
- Shadcn/ui for beautiful components  
- Monaco Editor for code editing  
- OpenAI, Anthropic, and Google for AI services
