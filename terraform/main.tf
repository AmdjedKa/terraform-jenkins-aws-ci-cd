terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

provider "kubernetes" {
  host                   = aws_eks_cluster.my_eks.endpoint
  cluster_ca_certificate = base64decode(aws_eks_cluster.my_eks.certificate_authority[0].data)

  exec {
    api_version = "client.authentication.k8s.io/v1beta1"
    args        = ["eks", "get-token", "--cluster-name", aws_eks_cluster.my_eks.name]
    command     = "aws"
  }
}

data "aws_availability_zones" "available" {
  state = "available"

  filter {
    name   = "opt-in-status"
    values = ["opt-in-not-required"]
  }
}

# VPC Configuration
resource "aws_vpc" "my_vpc" {
  cidr_block = var.vpc_cidr

  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    name        = "${var.project_name}-vpc"
    Environment = var.environment
    Project     = var.project_name
  }
}

# Public Subnets
resource "aws_subnet" "public" {
  count             = 3
  vpc_id            = aws_vpc.my_vpc.id
  cidr_block        = "10.0.${count.index + 1}.0/24"
  availability_zone = data.aws_availability_zones.available.names[count.index]

  tags = {
    Name                                 = "public-subnet-${count.index + 1}"
    "kubernetes.io/role/elb"             = "1"
    "kubernetes.io/cluster/main-cluster" = "shared"
  }
}

# Private Subnets
resource "aws_subnet" "private" {
  count             = 3
  vpc_id            = aws_vpc.my_vpc.id
  cidr_block        = "10.0.${count.index + 10}.0/24"
  availability_zone = data.aws_availability_zones.available.names[count.index]

  tags = {
    Name                                 = "private-subnet-${count.index + 1}"
    "kubernetes.io/role/internal-elb"    = "1"
    "kubernetes.io/cluster/main-cluster" = "shared"
  }
}

# Internet Gateway
resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.my_vpc.id

  tags = {
    Name = "main-igw"
  }
}

# NAT Gateway
resource "aws_nat_gateway" "main" {
  allocation_id = aws_eip.nat.id
  subnet_id     = aws_subnet.public[0].id # Use the first public subnet

  tags = {
    Name = "nat-gateway-main"
  }
}

# Elastic IPs for NAT Gateways
resource "aws_eip" "nat" {
  vpc = true

  tags = {
    Name = "nat-eip-main"
  }
}

# Route Table for Public Subnets
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.my_vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }

  tags = {
    Name = "public-rt"
  }
}

# Route Table for Private Subnets
resource "aws_route_table" "private" {
  vpc_id = aws_vpc.my_vpc.id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.main.id
  }

  tags = {
    Name = "private-rt"
  }
}


# Route Table Association for Public Subnets
resource "aws_route_table_association" "public" {
  count          = 3
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

# Route Table Association for Private Subnets
resource "aws_route_table_association" "private" {
  count          = length(aws_subnet.private)
  subnet_id      = aws_subnet.private[count.index].id
  route_table_id = aws_route_table.private.id
}

# Jenkins Security Group
resource "aws_security_group" "jenkins" {
  name        = "jenkins-sg"
  description = "Security group for Jenkins server"
  vpc_id      = aws_vpc.my_vpc.id

  ingress {
    from_port   = 8080
    to_port     = 8080
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Jenkins web interface"
  }

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "SSH access"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow all outbound traffic"
  }

  tags = {
    Name = "jenkins-sg"
  }
}

resource "aws_instance" "jenkins" {
  ami           = "ami-0e86e20dae9224db8"
  instance_type = "t2.large"
  subnet_id     = aws_subnet.public[0].id

  vpc_security_group_ids = [aws_security_group.jenkins.id]
  key_name               = var.key_pair_name

  root_block_device {
    volume_size = 30
    volume_type = "gp3"
  }

  associate_public_ip_address = true

  tags = {
    Name = "jenkins-server"
  }

  # Using remote-exec provisioner to install packages
  provisioner "remote-exec" {
    connection {
      type        = "ssh"
      private_key = file("./key.pem")
      user        = "ubuntu"
      host        = self.public_ip
    }

    inline = [
      # Install AWS CLI
      "sudo apt install unzip -y",
      "curl 'https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip' -o 'awscliv2.zip'",
      "unzip awscliv2.zip",
      "sudo ./aws/install",

      # Install Docker
      "sudo apt-get update -y",
      "sudo apt-get install -y ca-certificates curl",
      "sudo install -m 0755 -d /etc/apt/keyrings",
      "curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo tee /etc/apt/keyrings/docker.asc",
      "sudo chmod a+r /etc/apt/keyrings/docker.asc",
      "echo \"deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable\" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null",
      "sudo apt-get update -y",
      "sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin",
      "sudo usermod -aG docker ubuntu",
      "sudo chmod 777 /var/run/docker.sock",
      "docker --version",

      # Install Kubectl
      "curl -O https://s3.us-west-2.amazonaws.com/amazon-eks/1.30.4/2024-09-11/bin/linux/amd64/kubectl",
      "curl -O https://s3.us-west-2.amazonaws.com/amazon-eks/1.30.4/2024-09-11/bin/linux/amd64/kubectl.sha256",
      "sha256sum -c kubectl.sha256",
      "openssl sha1 -sha256 kubectl",
      "chmod +x ./kubectl",
      "mkdir -p $HOME/bin && cp ./kubectl $HOME/bin/kubectl && export PATH=$HOME/bin:$PATH",
      "echo 'export PATH=$HOME/bin:$PATH' >> ~/.bashrc",
      "sudo mv $HOME/bin/kubectl /usr/local/bin/kubectl",
      "sudo chmod +x /usr/local/bin/kubectl",
      "kubectl version --client",

      # Install Java 17
      "sudo apt update -y",
      "sudo apt install openjdk-17-jdk openjdk-17-jre -y",
      "java -version",

      # Install Jenkins
      "sudo wget -O /usr/share/keyrings/jenkins-keyring.asc https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key",
      "echo \"deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] https://pkg.jenkins.io/debian-stable binary/\" | sudo tee /etc/apt/sources.list.d/jenkins.list > /dev/null",
      "sudo apt-get update -y",
      "sudo apt-get install -y jenkins",
      "sudo systemctl start jenkins",
      "sudo systemctl enable jenkins",

      # Install Helm
      "wget https://get.helm.sh/helm-v3.16.1-linux-amd64.tar.gz",
      "tar -zxvf helm-v3.16.1-linux-amd64.tar.gz",
      "sudo mv linux-amd64/helm /usr/local/bin/helm",
      "helm version",
    ]
  }
}

# Security Group for EKS
resource "aws_security_group" "eks" {
  name        = "eks-cluster-sg"
  description = "Security group for EKS cluster"
  vpc_id      = aws_vpc.my_vpc.id

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name                                 = "eks-sg"
    "kubernetes.io/cluster/main-cluster" = "shared"
  }
}

# EKS Cluster
resource "aws_eks_cluster" "my_eks" {
  name     = "main-cluster"
  role_arn = "arn:aws:iam::${var.aws_account_id}:role/LabRole"

  vpc_config {
    subnet_ids         = concat(aws_subnet.public[*].id, aws_subnet.private[*].id)
    security_group_ids = [aws_security_group.eks.id]
  }

  enabled_cluster_log_types = ["api", "audit", "authenticator"]
}

# Node Group
resource "aws_eks_node_group" "main" {
  cluster_name    = aws_eks_cluster.my_eks.name
  node_group_name = "main-node-group"
  node_role_arn   = "arn:aws:iam::${var.aws_account_id}:role/LabRole"
  subnet_ids      = aws_subnet.private[*].id

  scaling_config {
    desired_size = 2
    max_size     = 4
    min_size     = 1
  }

  instance_types = ["t2.medium"]

  tags = {
    "kubernetes.io/cluster/main-cluster" = "owned"
  }
}

# Add Kubernetes secret resource (created after the RDS instance)
resource "kubernetes_secret" "db_credentials" {
  metadata {
    name      = "db-credentials"
    namespace = "default"
  }

  data = {
    DB_NAME      = aws_db_instance.main.db_name
    DB_USER      = aws_db_instance.main.username
    DB_PASSWORD  = aws_db_instance.main.password
    DB_HOST      = split(":", aws_db_instance.main.endpoint)[0] # Extract hostname without port
    DB_PORT      = "5432"
    DATABASE_URL = "postgresql://${aws_db_instance.main.username}:${aws_db_instance.main.password}@${split(":", aws_db_instance.main.endpoint)[0]}:5432/${aws_db_instance.main.db_name}"
  }

  type = "Opaque"

  depends_on = [aws_eks_cluster.my_eks]
}

resource "kubernetes_secret" "env" {
  metadata {
    name      = "env"
    namespace = "default"
  }

  data = {
    NODE_ENV   = var.environment
    JWT_SECRET = var.jwt_secret
  }

  type = "Opaque"

  depends_on = [aws_eks_cluster.my_eks]
}

# Security Group for RDS
resource "aws_security_group" "rds" {
  name_prefix = "${var.project_name}-rds-sg"
  vpc_id      = aws_vpc.my_vpc.id

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    cidr_blocks     = ["10.0.10.0/24", "10.0.11.0/24", "10.0.12.0/24"]
    security_groups = [aws_security_group.eks.id] # Allow access from EKS cluster
    description     = "PostgreSQL access from EKS"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "${var.project_name}-rds-sg"
    Environment = var.environment
    Project     = var.project_name
  }
}

# DB Subnet Group
resource "aws_db_subnet_group" "main" {
  name       = "${var.project_name}-db-subnet"
  subnet_ids = aws_subnet.private[*].id

  tags = {
    Environment = var.environment
    Project     = var.project_name
  }
}

# RDS Database
resource "aws_db_instance" "main" {
  identifier          = "${var.project_name}-db"
  allocated_storage   = 20
  storage_type        = "gp2"
  engine              = "postgres"
  engine_version      = "13.18"
  instance_class      = "db.t3.micro"
  db_name             = var.database_name
  username            = var.database_username
  password            = var.database_password
  skip_final_snapshot = true
  multi_az            = false

  vpc_security_group_ids = [aws_security_group.rds.id]
  db_subnet_group_name   = aws_db_subnet_group.main.name

  tags = {
    Environment = var.environment
    Project     = var.project_name
  }
}