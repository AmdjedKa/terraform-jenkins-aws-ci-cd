variable "aws_region" {
  description = "AWS region"
  default     = "us-east-1"
}

variable "project_name" {
  description = "Name of the project"
  default     = "microservices-ci-cd"
}

variable "environment" {
  description = "Environment (dev/staging/prod)"
  default     = "dev"
}

variable "vpc_cidr" {
  description = "CIDR block for VPC"
  default     = "10.0.0.0/16"
}

variable "key_pair_name" {
  description = "Key Pair"
  default     = "key"
}

variable "database_name" {
  description = "Name of the database"
  default     = "prod"
}

variable "database_username" {
  description = "Database master username"
  default     = "root"
}

variable "aws_account_id" {
  description = "Account ID"
  sensitive   = true
}

variable "database_password" {
  description = "Database master password"
  sensitive   = true
}

variable "jwt_secret" {
  description = "Secret key for JWT token generation"
  type        = string
  sensitive   = true
}
