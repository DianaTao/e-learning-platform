# E-Learning Platform


## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: Zustand
- **Routing**: React Router DOM v6
- **Charts**: Recharts
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Testing**: Vitest + React Testing Library

## Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/DianaTao/e-learning-platform.git
   cd e-learning-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

### Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Lint code
npm run lint

# Type check
npm run type-check
```

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── auth/           # Authentication components
│   ├── assignments/    # Assignment-related components
│   ├── courses/        # Course-related components
│   ├── layout/         # Layout components
│   └── ui/             # Base UI components
├── hooks/              # Custom React hooks
├── pages/              # Main page components
├── stores/             # Zustand state stores
├── types/              # TypeScript type definitions
├── lib/                # Utility functions and API client
├── test/               # Test utilities and setup
└── index.css           # Global styles
```

## 🔐 Authentication

The platform uses JWT-based authentication with the following features:

- **Auto-login**: In development mode, automatically logs in with demo credentials
- **Session Persistence**: Remembers user sessions across browser restarts
- **Protected Routes**: Automatic redirection to login for unauthenticated users

### Demo Credentials
- **Email**: `demo@example.com`
- **Password**: `demo123`



## 🧪 Testing

The project includes comprehensive testing setup:

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run test:coverage
```

### Test Structure
- **Unit Tests**: Component and utility function tests
- **Integration Tests**: Page-level functionality tests
- **Mock Data**: Realistic test data for all entities
