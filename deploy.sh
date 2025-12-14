#!/bin/bash

# Google ADK Agent Platform Deployment Script
# This script sets up both backend and frontend for the AI agent development platform

set -e

echo "🚀 Setting up Google ADK Agent Platform..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Python 3.9+ is installed
check_python() {
    if command -v python3 &> /dev/null; then
        PYTHON_VERSION=$(python3 -c 'import sys; print(".".join(map(str, sys.version_info[:2])))')
        if python3 -c "import sys; exit(0 if sys.version_info >= (3, 9) else 1)"; then
            print_success "Python $PYTHON_VERSION found"
        else
            print_error "Python 3.9+ required. Found Python $PYTHON_VERSION"
            exit 1
        fi
    else
        print_error "Python 3 not found. Please install Python 3.9+"
        exit 1
    fi
}

# Check if Node.js 18+ is installed
check_nodejs() {
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node -v)
        print_success "Node.js $NODE_VERSION found"
    else
        print_error "Node.js not found. Please install Node.js 18+"
        exit 1
    fi
}

# Setup backend
setup_backend() {
    print_status "Setting up backend..."
    
    cd backend
    
    # Create virtual environment
    if [ ! -d "venv" ]; then
        print_status "Creating Python virtual environment..."
        python3 -m venv venv
    fi
    
    # Activate virtual environment
    source venv/bin/activate
    
    # Upgrade pip
    pip install --upgrade pip
    
    # Install dependencies
    print_status "Installing Python dependencies..."
    pip install -r requirements.txt
    
    # Create environment file
    if [ ! -f ".env" ]; then
        print_status "Creating environment configuration..."
        cat > .env << EOF
# API Keys (add your actual keys)
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
MINIMAX_API_KEY=your_minimax_api_key_here

# Google Cloud Configuration
GOOGLE_CLOUD_PROJECT=your_project_id
GOOGLE_CLOUD_LOCATION=us-central1
GOOGLE_API_KEY=your_google_api_key

# Local Model Configuration
VLLM_HOST=localhost
VLLM_PORT=8000

# Application Configuration
ENVIRONMENT=development
LOG_LEVEL=info
EOF
        print_warning "Please update .env file with your actual API keys"
    fi
    
    # Test backend startup
    print_status "Testing backend startup..."
    python -c "
import sys
sys.path.append('.')
try:
    from main import app
    print('Backend import successful')
except Exception as e:
    print(f'Backend import failed: {e}')
    sys.exit(1)
"
    
    cd ..
    print_success "Backend setup complete"
}

# Setup frontend
setup_frontend() {
    print_status "Setting up frontend..."
    
    cd frontend
    
    # Install dependencies
    print_status "Installing Node.js dependencies..."
    npm install
    
    # Build frontend
    print_status "Building frontend..."
    npm run build
    
    cd ..
    print_success "Frontend setup complete"
}

# Setup local MiniMax-M2 (optional)
setup_local_minimax() {
    print_status "Setting up local MiniMax-M2 (optional)..."
    
    # Check for NVIDIA GPU
    if command -v nvidia-smi &> /dev/null; then
        print_success "NVIDIA GPU detected"
        
        # Ask user if they want to setup local MiniMax-M2
        read -p "Do you want to setup local MiniMax-M2? This requires significant GPU memory (y/N): " setup_local
        if [[ $setup_local =~ ^[Yy]$ ]]; then
            print_status "Installing vLLM for local model serving..."
            
            # Install vLLM
            pip install vllm
            
            # Create script to start local model
            cat > start_local_minimax.sh << 'EOF'
#!/bin/bash
# Start local MiniMax-M2 model using vLLM

echo "Starting local MiniMax-M2 model..."

# Check if model is available
if [ ! -d "models/minimax-m2" ]; then
    echo "Model not found. Please download MiniMax-M2 model first:"
    echo "https://huggingface.co/MiniMaxAI/MiniMax-M2"
    exit 1
fi

# Start vLLM server
python -m vllm.entrypoints.openai.api_server \
    --model models/minimax-m2 \
    --host 0.0.0.0 \
    --port 8000 \
    --tensor-parallel-size 1 \
    --max-model-len 4096 \
    --gpu-memory-utilization 0.9

EOF
            
            chmod +x start_local_minimax.sh
            print_success "Local MiniMax-M2 setup script created: start_local_minimax.sh"
        fi
    else
        print_warning "No NVIDIA GPU detected. Local MiniMax-M2 setup skipped."
    fi
}

# Main setup process
main() {
    print_status "Starting deployment setup..."
    
    # Check prerequisites
    check_python
    check_nodejs
    
    # Setup components
    setup_backend
    setup_frontend
    setup_local_minimax
    
    print_success "🎉 Deployment setup complete!"
    
    echo
    echo "📋 Next steps:"
    echo "1. Update backend/.env with your API keys"
    echo "2. Start the backend: cd backend && source venv/bin/activate && python main.py"
    echo "3. Start the frontend: cd frontend && npm run dev"
    echo "4. Open http://localhost:3000 in your browser"
    echo
    echo "🔧 Optional: Setup local MiniMax-M2 by running: ./start_local_minimax.sh"
    echo
    echo "📚 For more information, see the README.md file"
}

# Run main function
main