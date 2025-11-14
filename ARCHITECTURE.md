graph TB
    subgraph Internet
        User[👤 User]
    end
    
    subgraph "AWS Cloud"
        subgraph "VPC (10.0.0.0/16)"
            subgraph "Public Subnets"
                ALB[🔀 Application Load Balancer<br/>Port 80]
                IGW[🌐 Internet Gateway]
            end
            
            subgraph "Private Subnet 1"
                EC2[💻 EC2 Instance<br/>t2.micro]
                Frontend[📱 Frontend Container<br/>Nginx:80]
                Backend[⚙️ Backend Container<br/>Node.js:5000]
            end
            
            subgraph "Private DB Subnets"
                RDS[(🗄️ RDS PostgreSQL<br/>db.t3.micro)]
            end
            
            NAT[🔄 NAT Gateway]
        end
    end
    
    subgraph "External Services"
        DockerHub[🐳 Docker Hub<br/>Container Registry]
    end
    
    User -->|HTTP Request| ALB
    ALB -->|Route /| Frontend
    ALB -->|Route /api/*| Backend
    Frontend -.->|API Calls| Backend
    Backend -->|SQL Queries| RDS
    EC2 -->|Pull Images| DockerHub
    EC2 -->|Outbound Traffic| NAT
    NAT -->|Internet Access| IGW
    IGW -.->|Inbound| ALB
    
    style User fill:#e1f5ff
    style ALB fill:#ff9999
    style Frontend fill:#99ccff
    style Backend fill:#99ff99
    style RDS fill:#ffcc99
    style DockerHub fill:#66b3ff