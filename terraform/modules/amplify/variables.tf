variable "app_name" {
  description = "Amplify app name"
  type        = string
}

variable "repository" {
  description = "GitHub repository URL"
  type        = string
}

variable "branch" {
  description = "GitHub branch name"
  type        = string
}

variable "access_token" {
  description = "GitHub access token"
  type        = string
  sensitive   = true
}

variable "project_name" {
  description = "Project name for tagging"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "cognito_user_pool_id" {
  description = "Cognito User Pool ID"
  type        = string
}

variable "cognito_client_id" {
  description = "Cognito Client ID"
  type        = string
}

variable "api_gateway_endpoint" {
  description = "API Gateway endpoint URL"
  type        = string
}

variable "aws_region" {
  description = "AWS region"
  type        = string
}
