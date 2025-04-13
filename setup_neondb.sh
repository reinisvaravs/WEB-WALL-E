#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}WALL-E Web Chat - NeonDB Setup${NC}"
echo "====================================="
echo ""

# Check if psql is installed
if ! command -v psql &> /dev/null; then
    echo -e "${RED}Error: PostgreSQL client (psql) is not installed.${NC}"
    echo "Please install it to continue:"
    echo "  - macOS: brew install postgresql"
    echo "  - Ubuntu/Debian: sudo apt-get install postgresql-client"
    echo "  - Windows: Download from https://www.postgresql.org/download/windows/"
    exit 1
fi

# Prompt for NeonDB connection details
echo -e "${YELLOW}Please enter your NeonDB connection details:${NC}"
read -p "Database URL (from Neon dashboard): " DB_URL

if [ -z "$DB_URL" ]; then
    echo -e "${RED}Error: Database URL is required.${NC}"
    exit 1
fi

# Run the setup script
echo ""
echo -e "${YELLOW}Setting up database schema...${NC}"
PGPASSWORD=$(echo $DB_URL | grep -o ':[^:@]*@' | sed 's/://g' | sed 's/@//g') psql "$DB_URL" -f setup_neondb.sql

if [ $? -eq 0 ]; then
    echo -e "${GREEN}Database setup completed successfully!${NC}"
    
    # Update .env file with new database URL
    echo ""
    echo -e "${YELLOW}Updating .env file with new database URL...${NC}"
    
    # Check if .env file exists
    if [ -f .env ]; then
        # Update DATABASE_URL in .env file
        sed -i '' "s|DATABASE_URL=.*|DATABASE_URL=$DB_URL|" .env
        echo -e "${GREEN}.env file updated successfully!${NC}"
    else
        echo -e "${RED}Warning: .env file not found.${NC}"
        echo "Please manually update your .env file with:"
        echo "DATABASE_URL=$DB_URL"
    fi
else
    echo -e "${RED}Error: Database setup failed.${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}Setup complete!${NC}"
echo "You can now start your WALL-E web chatbot with the new NeonDB database."
echo "Run: npm start" 