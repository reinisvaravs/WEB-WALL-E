# WALL-E Web Chat

An AI-powered web chatbot with vector-based knowledge base integration, built with Node.js, Express, OpenAI, and NeonDB.

## Features

- Modern web chat interface
- Vector-based knowledge search with semantic understanding
- Automatic knowledge base updates from GitHub
- Conversation history tracking with session management
- Token usage monitoring and analytics
- Admin dashboard for system management
- Configurable AI model selection
- File change tracking and automatic re-embedding
- User interaction logging and statistics
- Secure database storage with NeonDB

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL client (psql)
- OpenAI API key
- GitHub token (for knowledge base integration)
- NeonDB account (for database hosting)

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/reinisvaravs/web-walle.git
cd web-walle
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root directory with the following variables:

```
# Web Chat Configuration
PORT=3000

# OpenAI
OPENAI_KEY=your_openai_api_key

# GitHub
GITHUB_TOKEN=your_github_token
REPO_API_URL=https://api.github.com/repos/reinisvaravs/walle-info/contents/
PROMPT_PATH_URL=https://api.github.com/repos/reinisvaravs/walle-info/contents/walle-config/system-prompt.txt

# Database
DATABASE_URL=your_neondb_connection_string

# Optional: Render detection (used in production)
# RENDER=true
```

### 4. Set Up NeonDB Database

#### Option 1: Using the Setup Script (Recommended)

1. Create a new project in [NeonDB](https://neon.tech)
2. Get your connection string from the Neon dashboard
3. Run the setup script:

```bash
./setup_neondb.sh
```

4. Enter your NeonDB connection string when prompted

The setup script will:

- Create necessary database tables
- Set up vector extensions
- Initialize configuration
- Create indexes for optimal performance

#### Option 2: Manual Setup

1. Create a new project in [NeonDB](https://neon.tech)
2. Get your connection string from the Neon dashboard
3. Update your `.env` file with the connection string
4. Run the SQL setup script:

```bash
psql your_connection_string -f setup_neondb.sql
```

### 5. Start the Server

```bash
npm start
```

The server will start on the port specified in your `.env` file (default: 3000).

## Usage

### Web Interface

Access the chat interface at:

```
http://localhost:3000
```

### Admin Dashboard

Access the admin dashboard at:

```
http://localhost:3000/admin.html
```

The admin dashboard provides:

- View and manage user conversation history
- Monitor token usage and costs
- Change AI model configuration
- View system statistics
- Monitor user interactions
- Track file changes and embeddings
- View knowledge base status

## Knowledge Base Integration

The chatbot integrates with a GitHub repository to load and maintain its knowledge base:

1. The system automatically loads knowledge from markdown files in your repository
2. Files are processed and converted into vector embeddings
3. The system tracks file changes and automatically re-embeds modified content
4. Knowledge is retrieved using semantic search based on user queries

### Knowledge Base Structure

- Place markdown files in your GitHub repository
- Files are automatically processed and embedded
- The system prompt can be updated through the repository
- File changes trigger automatic re-embedding

## Database Schema

The system uses the following tables:

- `vectors`: Stores document chunks and their embeddings
- `file_hashes`: Tracks file changes
- `bot_config`: Stores system configuration
- `user_logs`: Records user interactions
- `bot_stats`: Tracks usage statistics

## License

[MIT License](LICENSE)
