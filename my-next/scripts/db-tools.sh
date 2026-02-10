#!/bin/bash

# Database Export/Import Scripts for Railway Food Service

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚂 Railway Food Service - Database Tools${NC}"
echo "=========================================="
echo ""

# Check if we're running in Docker
if [ -f /.dockerenv ]; then
    DB_HOST="postgres"
    DB_USER="railway"
    DB_PASSWORD="railway123"
    DB_NAME="railway_food"
else
    DB_HOST="localhost"
    DB_USER="${DB_USER:-railway}"
    DB_PASSWORD="${DB_PASSWORD:-railway123}"
    DB_NAME="${DB_NAME:-railway_food}"
fi

# Function to export database
export_db() {
    echo -e "${BLUE}📤 Exporting database...${NC}"
    EXPORT_FILE="railway_db_backup_$(date +%Y%m%d_%H%M%S).sql"
    
    if [ -f /.dockerenv ]; then
        # Inside Docker
        PGPASSWORD=$DB_PASSWORD pg_dump -h $DB_HOST -U $DB_USER -d $DB_NAME > $EXPORT_FILE
    else
        # Outside Docker
        if docker ps | grep -q railway_db; then
            docker exec railway_db pg_dump -U $DB_USER -d $DB_NAME > $EXPORT_FILE
        else
            PGPASSWORD=$DB_PASSWORD pg_dump -h $DB_HOST -U $DB_USER -d $DB_NAME > $EXPORT_FILE
        fi
    fi
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Database exported to: $EXPORT_FILE${NC}"
        echo ""
        echo "📧 Send this file to your friend!"
        echo "They can import it using: ./db-tools.sh import $EXPORT_FILE"
    else
        echo -e "${RED}❌ Export failed${NC}"
    fi
}

# Function to import database
import_db() {
    if [ -z "$1" ]; then
        echo -e "${RED}❌ Please provide the SQL file to import${NC}"
        echo "Usage: ./db-tools.sh import <filename.sql>"
        exit 1
    fi
    
    SQL_FILE=$1
    
    if [ ! -f "$SQL_FILE" ]; then
        echo -e "${RED}❌ File not found: $SQL_FILE${NC}"
        exit 1
    fi
    
    echo -e "${BLUE}📥 Importing database from: $SQL_FILE${NC}"
    echo "⚠️  This will overwrite existing data!"
    read -p "Continue? (y/n) " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        if [ -f /.dockerenv ]; then
            # Inside Docker
            PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U $DB_USER -d $DB_NAME < $SQL_FILE
        else
            # Outside Docker
            if docker ps | grep -q railway_db; then
                docker exec -i railway_db psql -U $DB_USER -d $DB_NAME < $SQL_FILE
            else
                PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U $DB_USER -d $DB_NAME < $SQL_FILE
            fi
        fi
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ Database imported successfully${NC}"
        else
            echo -e "${RED}❌ Import failed${NC}"
        fi
    else
        echo "Import cancelled"
    fi
}

# Function to seed database with sample data
seed_db() {
    echo -e "${BLUE}🌱 Seeding database with sample data...${NC}"
    node prisma/seed-full.js
}

# Function to reset database
reset_db() {
    echo -e "${BLUE}🔄 Resetting database...${NC}"
    echo "⚠️  This will delete ALL data and recreate tables!"
    read -p "Continue? (y/n) " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        npx prisma migrate reset --force
        echo -e "${GREEN}✅ Database reset complete${NC}"
    else
        echo "Reset cancelled"
    fi
}

# Main menu
case "$1" in
    export)
        export_db
        ;;
    import)
        import_db "$2"
        ;;
    seed)
        seed_db
        ;;
    reset)
        reset_db
        ;;
    *)
        echo "Usage: $0 {export|import|seed|reset}"
        echo ""
        echo "Commands:"
        echo "  export          - Export current database to SQL file"
        echo "  import <file>   - Import database from SQL file"
        echo "  seed            - Seed database with sample data"
        echo "  reset           - Reset database (deletes all data)"
        echo ""
        echo "Examples:"
        echo "  $0 export"
        echo "  $0 import backup.sql"
        echo "  $0 seed"
        exit 1
        ;;
esac
