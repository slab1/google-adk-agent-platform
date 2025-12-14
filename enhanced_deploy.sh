#!/bin/bash

# Enhanced Google ADK Agent Platform Deployment Script
# Features: Better error handling, health checks, local model setup, production deployment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/backend"
FRONTEND_DIR="$SCRIPT_DIR/frontend"
VENV_DIR="$BACKEND_DIR/venv"
LOG_FILE="$SCRIPT_DIR/deployment.log"

# Logging function
log() {
    local level=$1
    shift
    local message="$*"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "${timestamp} [${level}] ${message}" | tee -a "$LOG_FILE"
}

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1" | tee -a "$LOG_FILE"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$LOG_FILE"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
}

print_header() {
    echo -e "\n${PURPLE}================================${NC}"
    echo -e "${PURPLE}$1${NC}"
    echo -e "${PURPLE}================================${NC}\n" | tee -a "$LOG_FILE"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check system requirements
check_requirements() {
    print_header "Checking System Requirements"
    
    local requirements_met=true
    
    # Check Python
    if command_exists python3; then
        local python_version=$(python3 -c 'import sys; print(".".join(map(str, sys.version_info[:2])))')
        if python3 -c "import sys; exit(0 if sys.version_info >= (3, 9) else 1)"; then
            print_success "Python $python_version found"
        else
            print_error "Python 3.9+ required. Found Python $python_version"
            requirements_met=false
        fi
    else
        print_error "Python 3 not found. Please install Python 3.9+"
        requirements_met=false
    fi
    
    # Check Node.js
    if command_exists node; then
        local node_version=$(node -v)
        print_success "Node.js $node_version found"
    else
        print_error "Node.js not found.js 18+. Please install Node"
        requirements_met=false
    fi
    
    # Check npm
    if command_exists npm; then
        local npm_version=$(npm -v)
        print_success "npm $npm_version found"
    else
        print_error "npm not found. Please install npm"
        requirements_met=false
    fi
    
    # Check Docker (optional)
    if command_exists docker; then
        print_success "Docker found"
        docker_version=$(docker --version | cut -d' ' -f3 | cut -d',' -f1)
        print_status "Docker version: $docker_version"
    else
        print_warning "Docker not found. Docker deployment will be skipped."
    fi
    
    # Check Docker Compose (optional)
    if command_exists docker-compose; then
        print_success "Docker Compose found"
    elif docker compose version >/dev/null 2>&1; then
        print_success "Docker Compose (plugin) found"
    else
        print_warning "Docker Compose not found. Docker deployment will be skipped."
    fi
    
    # Check available memory
    local total_mem=$(free -m | awk 'NR==2{printf "%.0f", $2}')
    local available_mem=$(free -m | awk 'NR==2{printf "%.0f", $7}')
    
    print_status "Total Memory: ${total_mem}MB, Available: ${available_mem}MB"
    
    if [ $available_mem -lt 8192 ]; then
        print_warning "Less than 8GB available memory. Local MiniMax-M2 may not work optimally."
    fi
    
    # Check disk space
    local available_space=$(df -BG "$SCRIPT_DIR" | awk 'NR==2 {print $4}' | sed 's/G//')
    if [ $available_space -lt 20 ]; then
        print_warning "Less than 20GB disk space available. Model downloads may fail."
    fi
    
    if [ "$requirements_met" = false ]; then
        print_error "System requirements not met. Please install missing dependencies."
        exit 1
    fi
    
    print_success "All system requirements met!"
}

# Setup backend with error handling
setup_backend() {
    print_header "Setting Up Backend"
    
    cd "$BACKEND_DIR"
    
    # Create virtual environment
    if [ ! -d "$VENV_DIR" ]; then
        print_status "Creating Python virtual environment..."
        python3 -m venv "$VENV_DIR"
        print_success "Virtual environment created"
    else
        print_status "Virtual environment already exists"
    fi
    
    # Activate virtual environment
    source "$VENV_DIR/bin/activate"
    
    # Upgrade pip
    print_status "Upgrading pip..."
    pip install --upgrade pip --quiet
    
    # Install dependencies
    print_status "Installing Python dependencies..."
    if pip install -quiet; then
r requirements.txt --        print_success "Python dependencies installed"
    else
        print_error "Failed to install Python dependencies"
        exit 1
    fi
    
    # Setup environment file
    if [ ! -f ".env" ]; then
        print_status "Creating environment configuration..."
        cp .env.example .env
        print_warning "Please update .env file with your API keys and configuration"
        print_status "Location: $BACKEND_DIR/.env"
    else
        print_status "Environment file already exists"
    fi
    
    # Test backend import
    print_status "Testing backend imports..."
    if python -c "
import sys
sys.path.append('.')
try:
    from main import app
    print('Backend import successful')
except Exception as e:
    print(f'Backend import failed: {e}')
    sys.exit(1)
"; then
        print_success "Backend import test passed"
    else
        print_error "Backend import test failed"
        exit 1
    fi
    
    cd "$SCRIPT_DIR"
    print_success "Backend setup complete"
}

# Setup frontend
setup_frontend() {
    print_header "Setting Up Frontend"
    
    cd "$FRONTEND_DIR"
    
    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        print_status "Installing Node.js dependencies..."
        if npm install --silent; then
            print_success "Node.js dependencies installed"
        else
            print_error "Failed to install Node.js dependencies"
            exit 1
        fi
    else
        print_status "Node.js dependencies already installed"
    fi
    
    # Test TypeScript compilation
    print_status "Testing TypeScript compilation..."
    if npm run type-check --silent; then
        print_success "TypeScript compilation test passed"
    else
        print_warning "TypeScript compilation test failed, but continuing..."
    fi
    
    # Build frontend for production
    print_status "Building frontend..."
    if npm run build --silent; then
        print_success "Frontend build completed"
    else
        print_error "Frontend build failed"
        exit 1
    fi
    
    cd "$SCRIPT_DIR"
    print_success "Frontend setup complete"
}

# Setup local MiniMax-M2 with GPU detection
setup_local_minimax() {
    print_header "Setting Up Local MiniMax-M2"
    
    # Check for NVIDIA GPU
    if command_exists nvidia-smi; then
        local gpu_info=$(nvidia-smi --query-gpu=name,memory.total --format=csv,noheader,nounits 2>/dev/null || echo "Unknown GPU")
        print_success "NVIDIA GPU detected: $gpu_info"
        
        # Check GPU memory
        local gpu_memory=$(nvidia-smi --query-gpu=memory.total --format=csv,noheader,nounits 2>/dev/null | head -1)
        if [ ! -z "$gpu_memory" ] && [ $gpu_memory -ge 24000 ]; then
            print_success "Su (fficient GPU memory detected${gpu_memory}MB)"
        elif [ ! -z "$gpu_memory" ]; then
            print_warning "Limited GPU memory (${gpu_memory}MB). MiniMax-M2 may require quantization."
        fi
        
        # Ask user about local MiniMax-M2 setup
        echo
        read -p "Do you want to setup local MiniMax-M2? This requires significant GPU memory (y/N): " setup_local
        if [[ $setup_local =~ ^[Yy]$ ]]; then
            setup_minimax_vllm
        fi
    else
        print_warning "No NVIDIA GPU detected. Local MiniMax-M2 setup skipped."
        print_status "For local MiniMax-M2, you need an NVIDIA GPU with 24GB+ VRAM"
    fi
}

# Setup vLLM for MiniMax-M2
setup_minimax_vllm() {
    print_status "Setting up vLLM for MiniMax-M2..."
    
    cd "$BACKEND_DIR"
    source "$VENV_DIR/bin/activate"
    
    # Install vLLM
    print_status "Installing vLLM..."
    if pip install vllm --quiet; then
        print_success "vLLM installed"
    else
        print_error "Failed to install vLLM"
        return 1
    fi
    
    # Create models directory
    mkdir -p models
    
    # Check if MiniMax-M2 model is available
    if [ ! -d "models/minimax-m2" ]; then
        print_status "MiniMax-M2 model not found locally"
        print_status "Options:"
        echo "1. Download model manually from: https://huggingface.co/MiniMaxAI/MiniMax-M2"
        echo "2. Use the model directly if available"
        echo "3. Skip for now and use API version"
        
        read -p "Download MiniMax-M2 model now? This requires significant bandwidth (y/N): " download_model
        if [[ $download_model =~ ^[Yy]$ ]]; then
            download_minimax_model
        fi
    else
        print_success "MiniMax-M2 model found locally"
    fi
    
    # Create startup script
    create_minimax_startup_script
    
    cd "$SCRIPT_DIR"
    print_success "Local MiniMax-M2 setup complete"
}

# Download MiniMax-M2 model
download_minimax_model() {
    print_status "Downloading MiniMax-M2 model..."
    
    cd "$BACKEND_DIR/models"
    
    # Check if git-lfs is available
    if command_exists git-lfs; then
        git lfs install
        git clone https://huggingface.co/MiniMaxAI/MiniMax-M2.git minimax-m2
    else
        print_warning "git-lfs not found. Please install it or download manually."
        print_status "Manual download URL: https://huggingface.co/MiniMaxAI/MiniMax-M2"
        return 1
    fi
    
    print_success "MiniMax-M2 model downloaded"
}

# Create startup script for MiniMax-M2
create_minimax_startup_script() {
    print_status "Creating MiniMax-M2 startup script..."
    
    cat > start_local_minimax.sh << 'EOF'
#!/bin/bash
# Start local MiniMax-M2 model using vLLM

echo "🚀 Starting local MiniMax-M2 model..."

# Check if model directory exists
if [ ! -d "models/minimax-m2" ]; then
    echo "❌ Model not found. Please download MiniMax-M2 model first:"
    echo "   https://huggingface.co/MiniMaxAI/MiniMax-M2"
    exit 1
fi

# Check GPU availability
if ! command -v nvidia-smi >/dev/null 2>&1; then
    echo "❌ NVIDIA GPU not detected. MiniMax-M2 requires CUDA GPU."
    exit 1
fi

# Set environment variables
export CUDA_VISIBLE_DEVICES=0
export MODEL_NAME="minimax-m2"
export HOST="0.0.0.0"
export PORT="8000"

echo "📊 GPU Information:"
nvidia-smi --query-gpu=name,memory.total,memory.free --format=csv,noheader

echo "🔥 Starting vLLM server..."
python -m vllm.entrypoints.openai.api_server \
    --model models/minimax-m2 \
    --host $HOST \
    --port $PORT \
    --tensor-parallel-size 1 \
    --max-model-len 4096 \
    --gpu-memory-utilization 0.9 \
    --enable-auto-tool-choice \
    --trust-remote-code

echo "✅ MiniMax-M2 server started at http://localhost:$PORT"
echo "📝 API endpoint: http://localhost:$PORT/v1"
echo "🏥 Health check: curl http://localhost:$PORT/health"
EOF
    
    chmod +x start_local_minimax.sh
    print_success "Startup script created: start_local_minimax.sh"
}

# Health checks
run_health_checks() {
    print_header "Running Health Checks"
    
    local backend_port=8000
    local frontend_port=3000
    
    # Check if ports are available
    if lsof -Pi :$backend_port -sTCP:LISTEN -t >/dev/null 2>&1; then
        print_warning "Port $backend_port is already in use"
    else
        print_success "Port $backend_port is available"
    fi
    
    if lsof -Pi :$frontend_port -sTCP:LISTEN -t >/dev/null 2>&1; then
        print_warning "Port $frontend_port is already in use"
    else
        print_success "Port $frontend_port is available"
    fi
    
    # Test backend endpoint
    print_status "Testing backend endpoint..."
    if curl -f -s http://localhost:$backend_port/health >/dev/null 2>&1; then
        print_success "Backend health check passed"
    else
        print_warning "Backend not running (this is expected before startup)"
    fi
    
    # Test frontend build
    print_status "Testing frontend build..."
    if [ -f "$FRONTEND_DIR/dist/index.html" ]; then
        print_success "Frontend build is valid"
    else
        print_error "Frontend build is missing or invalid"
        exit 1
    fi
}

# Create systemd service files (Linux)
create_systemd_services() {
    if [ "$1" = "--systemd" ]; then
        print_header "Creating Systemd Services"
        
        local service_dir="/etc/systemd/system"
        local user_dir="$HOME/.config/systemd/user"
        
        # Create user systemd directory
        mkdir -p "$user_dir"
        
        # Backend service
        cat > "$user_dir/adk-backend.service" << EOF
[Unit]
Description=Google ADK Agent Platform Backend
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$BACKEND_DIR
Environment=PATH=$VENV_DIR/bin
ExecStart=$VENV_DIR/bin/python main.py
Restart=always
RestartSec=10

[Install]
WantedBy=default.target
EOF
        
        # Frontend service (using serve)
        cat > "$user_dir/adk-frontend.service" << EOF
[Unit]
Description=Google ADK Agent Platform Frontend
After=network.target adk-backend.service

[Service]
Type=simple
User=$USER
WorkingDirectory=$FRONTEND_DIR/dist
ExecStart=npx serve -s . -l 3000
Restart=always
RestartSec=10

[Install]
WantedBy=default.target
EOF
        
        print_success "Systemd service files created in $user_dir"
        print_status "To enable services: systemctl --user enable adk-backend adk-frontend"
        print_status "To start services: systemctl --user start adk-backend adk-frontend"
    fi
}

# Docker deployment
docker_deployment() {
    if [ "$1" = "--docker" ]; then
        print_header "Docker Deployment"
        
        if ! command_exists docker || ! docker compose version >/dev/null 2>&1; then
            print_error "Docker or Docker Compose not available"
            return 1
        fi
        
        print_status "Building and starting containers..."
        if docker-compose up -d --build; then
            print_success "Docker containers started"
            print_status "Backend: http://localhost:8000"
            print_status "Frontend: http://localhost:3000"
            print_status "Health: http://localhost:3000/health"
        else
            print_error "Docker deployment failed"
            exit 1
        fi
    fi
}

# Main deployment function
main() {
    print_header "Google ADK Agent Platform Deployment"
    print_status "Starting deployment at $(date)"
    
    # Parse command line arguments
    local deployment_type="development"
    local create_services=false
    local use_docker=false
    
    for arg in "$@"; do
        case $arg in
            --production)
                deployment_type="production"
                ;;
            --systemd)
                create_services=true
                ;;
            --docker)
                use_docker=true
                ;;
            --help)
                echo "Usage: $0 [OPTIONS]"
                echo ""
                echo "Options:"
                echo "  --production    Enable production mode"
                echo "  --systemd       Create systemd service files"
                echo "  --docker        Use Docker deployment"
                echo "  --help          Show this help message"
                echo ""
                echo "Examples:"
                echo "  $0                    # Development deployment"
                echo "  $0 --production       # Production deployment"
                echo "  $0 --docker           # Docker deployment"
                echo "  $0 --systemd          # Create systemd services"
                exit 0
                ;;
        esac
    done
    
    # Run deployment steps
    check_requirements
    setup_backend
    setup_frontend
    setup_local_minimax
    run_health_checks
    
    # Optional features
    if [ "$create_services" = true ]; then
        create_systemd_services --systemd
    fi
    
    if [ "$use_docker" = true ]; then
        docker_deployment --docker
    fi
    
    # Print final instructions
    print_header "Deployment Complete!"
    
    echo -e "${GREEN}🎉 Google ADK Agent Platform deployed successfully!${NC}"
    echo
    echo -e "${CYAN}📋 Next Steps:${NC}"
    echo "1. Update backend/.env with your API keys"
    echo "2. Start the backend:"
    echo "   cd backend && source venv/bin/activate && python main.py"
    echo "3. Start the frontend (new terminal):"
    echo "   cd frontend && npm run dev"
    echo "4. Open http://localhost:3000 in your browser"
    echo
    
    if [ -f "$BACKEND_DIR/start_local_minimax.sh" ]; then
        echo -e "${CYAN}🤖 Local MiniMax-M2:${NC}"
        echo "To start local MiniMax-M2 model:"
        echo "   cd backend && ./start_local_minimax.sh"
        echo
    fi
    
    echo -e "${CYAN}📚 Documentation:${NC}"
    echo "- API Documentation: http://localhost:8000/docs"
    echo "- Health Check: http://localhost:8000/health"
    echo "- Model Management: http://localhost:3000/models"
    echo
    
    if [ "$deployment_type" = "production" ]; then
        echo -e "${YELLOW}⚠️  Production Deployment:${NC}"
        echo "- Configure SSL/TLS certificates"
        echo "- Set up reverse proxy (nginx/apache)"
        echo "- Configure database for persistence"
        echo "- Set up monitoring and logging"
        echo "- Configure rate limiting and security headers"
    fi
    
    echo -e "${GREEN}✨ Happy coding with Google ADK and MiniMax-M2!${NC}"
    
    # Log completion
    log "INFO" "Deployment completed successfully at $(date)"
}

# Handle script interruption
cleanup() {
    print_error "Deployment interrupted"
    exit 1
}

trap cleanup INT TERM

# Run main function with all arguments
main "$@"