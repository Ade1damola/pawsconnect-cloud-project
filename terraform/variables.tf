# This file defines variables we can customize

variable "aws_region" {
  description = "AWS region to deploy resources"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Name of the project"
  type        = string
  default     = "pawsconnect"
}

variable "environment" {
  description = "Environment (dev, staging, prod)"
  type        = string
  default     = "prod"
}

variable "db_username" {
  description = "Database master username"
  type        = string
  default     = "dbadmin"
}

variable "db_password" {
  description = "Database master password"
  type        = string
  sensitive   = true
}

variable "db_name" {
  description = "Database name"
  type        = string
  default     = "pawsconnect"
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t2.micro"
}

variable "docker_image_backend" {
  description = "Docker image for backend"
  type        = string
  default     = "your-dockerhub-username/pawsconnect-backend:latest"
}

variable "docker_image_frontend" {
  description = "Docker image for frontend"
  type        = string
  default     = "your-dockerhub-username/pawsconnect-frontend:latest"
}

variable "my_ip" {
  description = "Your IP address for SSH access"
  type        = string
  default     = "0.0.0.0/0"
}