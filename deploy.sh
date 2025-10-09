#!/bin/bash

# ============================================
# Study App Deployment Script
# ============================================

set -e  # Exit on error

echo "============================================"
echo "  Study App Deployment Script"
echo "============================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}Warning: .env file not found!${NC}"
    echo "Creating .env from .env.example..."
    cp .env.example .env
    echo -e "${YELLOW}Please edit .env file with your actual credentials before continuing.${NC}"
    echo "Press Enter to continue after editing .env, or Ctrl+C to exit..."
    read -r
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Error: Docker is not installed!${NC}"
    echo "Please install Docker from https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker compose &> /dev/null && ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}Error: Docker Compose is not installed!${NC}"
    echo "Please install Docker Compose from https://docs.docker.com/compose/install/"
    exit 1
fi

# Use the correct docker-compose command
if command -v docker compose &> /dev/null; then
    DOCKER_COMPOSE="docker compose"
else
    DOCKER_COMPOSE="docker-compose"
fi

echo -e "${GREEN}✓ Docker and Docker Compose are installed${NC}"
echo ""

# Function to show menu
show_menu() {
    echo "============================================"
    echo "  What would you like to do?"
    echo "============================================"
    echo "1) Start all services (first time setup)"
    echo "2) Start all services (normal)"
    echo "3) Stop all services"
    echo "4) Restart all services"
    echo "5) View logs"
    echo "6) View service status"
    echo "7) Clean up (remove containers and volumes)"
    echo "8) Rebuild containers"
    echo "9) Pull Ollama model manually"
    echo "0) Exit"
    echo ""
}

# Function to start services
start_services() {
    echo -e "${GREEN}Starting services...${NC}"
    $DOCKER_COMPOSE up -d
    echo ""
    echo -e "${GREEN}✓ Services started successfully!${NC}"
    echo ""
    echo "Services are running:"
    echo "  - Backend API: http://localhost:5000"
    echo "  - AI Service: http://localhost:8000"
    echo "  - MongoDB: MongoDB Atlas (Cloud)"
    echo "  - Ollama: http://localhost:11434"
    echo ""
    echo -e "${YELLOW}Note: Ollama might take a few minutes to download the embedding model on first run.${NC}"
    echo "You can check the logs with: $DOCKER_COMPOSE logs -f ollama"
}

# Function to start with build
start_with_build() {
    echo -e "${GREEN}Building and starting services...${NC}"
    $DOCKER_COMPOSE up -d --build
    echo ""
    echo -e "${GREEN}✓ Services started successfully!${NC}"
    show_urls
}

# Function to stop services
stop_services() {
    echo -e "${YELLOW}Stopping services...${NC}"
    $DOCKER_COMPOSE down
    echo -e "${GREEN}✓ Services stopped${NC}"
}

# Function to restart services
restart_services() {
    echo -e "${YELLOW}Restarting services...${NC}"
    $DOCKER_COMPOSE restart
    echo -e "${GREEN}✓ Services restarted${NC}"
}

# Function to view logs
view_logs() {
    echo "Which service logs do you want to view?"
    echo "1) All services"
    echo "2) Backend"
    echo "3) AI Service"
    echo "4) Ollama"
    read -p "Enter choice: " log_choice
    
    case $log_choice in
        1) $DOCKER_COMPOSE logs -f ;;
        2) $DOCKER_COMPOSE logs -f backend ;;
        3) $DOCKER_COMPOSE logs -f ai-service ;;
        4) $DOCKER_COMPOSE logs -f ollama ;;
        *) echo "Invalid choice" ;;
    esac
}

# Function to view status
view_status() {
    echo -e "${GREEN}Service Status:${NC}"
    $DOCKER_COMPOSE ps
}

# Function to clean up
cleanup() {
    echo -e "${RED}WARNING: This will remove all containers and volumes!${NC}"
    echo "Your data will be lost. Are you sure? (yes/no)"
    read -p "> " confirm
    
    if [ "$confirm" = "yes" ]; then
        echo -e "${YELLOW}Cleaning up...${NC}"
        $DOCKER_COMPOSE down -v
        echo -e "${GREEN}✓ Cleanup complete${NC}"
    else
        echo "Cleanup cancelled"
    fi
}

# Function to rebuild
rebuild() {
    echo -e "${YELLOW}Rebuilding containers...${NC}"
    $DOCKER_COMPOSE up -d --build --force-recreate
    echo -e "${GREEN}✓ Rebuild complete${NC}"
}

# Function to pull Ollama model
pull_ollama_model() {
    echo -e "${GREEN}Pulling nomic-embed-text model...${NC}"
    docker exec study-app-ollama ollama pull nomic-embed-text
    echo -e "${GREEN}✓ Model pulled successfully${NC}"
}

# Function to show URLs
show_urls() {
    echo ""
    echo "Services are running:"
    echo "  - Backend API: http://localhost:5000"
    echo "  - AI Service: http://localhost:8000"
    echo "  - MongoDB: MongoDB Atlas (Cloud)"
    echo "  - Ollama: http://localhost:11434"
    echo ""
}

# Main loop
while true; do
    show_menu
    read -p "Enter choice: " choice
    echo ""
    
    case $choice in
        1) start_with_build ;;
        2) start_services ;;
        3) stop_services ;;
        4) restart_services ;;
        5) view_logs ;;
        6) view_status ;;
        7) cleanup ;;
        8) rebuild ;;
        9) pull_ollama_model ;;
        0) echo "Goodbye!"; exit 0 ;;
        *) echo -e "${RED}Invalid choice${NC}" ;;
    esac
    
    echo ""
    read -p "Press Enter to continue..."
    echo ""
done
