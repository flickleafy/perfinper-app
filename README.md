# Personal Finance Helper App (perfinper-app)

A modern React-based web application for personal finance management. This app provides an intuitive interface for tracking and managing financial transactions, with support for multiple data sources and comprehensive filtering capabilities.

## 🚀 Features

- **Transaction Management**: View, create, edit, and delete financial transactions
- **Category Organization**: Organize transactions with customizable categories and icons
- **Period Filtering**: Filter transactions by month and year with an intuitive period selector
- **Search Functionality**: Quickly find transactions using the search bar
- **Status Tracking**: Visual indicators for transaction status (concluded, refunded, started)
- **Installment Display**: View credit card installment details
- **Responsive Design**: Material-UI based responsive interface
- **Loading Indicators**: Visual feedback during data operations

## 🛠️ Technology Stack

- **Framework**: React 18.x with Create React App
- **UI Library**: Material-UI (MUI) 5.x
- **Icons**: @mui/icons-material
- **Date Handling**: date-fns 3.x
- **HTTP Client**: Axios
- **Routing**: React Router DOM 6.x
- **State Management**: React Context/Hooks
- **Testing**: Jest + React Testing Library
- **Linting**: ESLint with Airbnb config

## 📋 Prerequisites

- Node.js 18.x or higher
- npm or yarn package manager
- Backend API running (perfinper-api)

## 🔧 Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd perfinper-app
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure API endpoint**
   Update the API base URL in the services configuration if needed.

4. **Start the development server**

   ```bash
   npm run dev
   ```

## 🚀 Quick Start

Once the development server is running, you can access:

- Development URL: `http://localhost:3000`
- The app will automatically connect to the backend API

## 📚 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Starts the development server with hot reloading |
| `npm start` | Serves the production build |
| `npm run build` | Creates an optimized production build |
| `npm test` | Runs the test suite |
| `npm run eject` | Ejects from Create React App (one-way operation) |

## 🏗️ Project Structure

```
perfinper-app/
├── public/              # Static assets and HTML template
├── src/
│   ├── components/      # React components
│   │   ├── Buttons/     # Button components
│   │   ├── EditTransaction.js
│   │   ├── InsertTransaction.js
│   │   ├── LoadingIndicator.js
│   │   ├── PeriodSelector.js
│   │   ├── SearchBar.js
│   │   ├── StatusBar.js
│   │   ├── TransactionsList.js
│   │   ├── TransactionsListFooter.js
│   │   └── TransactionsListHeader.js
│   ├── infrastructure/  # Configuration and utilities
│   ├── services/        # API service layer
│   ├── ui/              # UI primitives and theming
│   ├── test-utils/      # Testing utilities
│   ├── App.js           # Main application component
│   ├── index.js         # Application entry point
│   └── serviceWorker.js # PWA service worker
├── .env                 # Environment variables
└── package.json         # Project dependencies
```

## 🎨 Key Components

| Component | Description |
|-----------|-------------|
| `App.js` | Main application with routing and global state |
| `TransactionsList.js` | Displays list of transactions with actions |
| `EditTransaction.js` | Form for editing existing transactions |
| `InsertTransaction.js` | Form for creating new transactions |
| `PeriodSelector.js` | Month/year period selection component |
| `SearchBar.js` | Transaction search functionality |
| `StatusBar.js` | Application status and notifications |
| `LoadingIndicator.js` | Loading spinner overlay |

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
REACT_APP_API_URL=http://localhost:3001/api
```

| Variable | Description | Default |
|----------|-------------|---------|
| `REACT_APP_API_URL` | Backend API base URL | `http://localhost:3001/api` |

## 🧪 Testing

Run the test suite:

```bash
npm test
```

Run tests with coverage:

```bash
npm test -- --coverage
```

## 🔒 Security Notes

- Ensure the backend API is properly secured
- Validate all user input before submission
- Use HTTPS in production
- Keep dependencies updated

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is licensed under the terms specified in the LICENSE file.

## 🐛 Issues and Support

For bug reports, feature requests, or support, please open an issue in the repository.

## 🔄 Version History

- **v1.0.0**: Initial release with core functionality
  - Transaction list view
  - Create/Edit transaction forms
  - Period-based filtering
  - Category management
  - Material-UI integration
