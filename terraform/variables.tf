variable "aws_region" {
  description = "AWS region for resource deployment"
  type        = string
}

variable "project_name" {
  description = "Project name used for resource naming"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "allowed_email_domains" {
  description = "List of allowed email domains for user signup"
  type        = list(string)
}

variable "cognito_user_pool_name" {
  description = "Name for Cognito User Pool"
  type        = string
}

variable "cognito_client_name" {
  description = "Name for Cognito User Pool Client"
  type        = string
}

variable "tasks_table_name" {
  description = "DynamoDB table name for tasks"
  type        = string
}

variable "assignments_table_name" {
  description = "DynamoDB table name for task assignments"
  type        = string
}

variable "api_gateway_name" {
  description = "Name for API Gateway"
  type        = string
}

variable "api_gateway_stage" {
  description = "API Gateway deployment stage"
  type        = string
}

variable "sns_topic_name" {
  description = "SNS topic name for notifications"
  type        = string
}

variable "lambda_runtime" {
  description = "Lambda function runtime"
  type        = string
}

variable "lambda_timeout" {
  description = "Lambda function timeout in seconds"
  type        = number
}

variable "lambda_memory_size" {
  description = "Lambda function memory size in MB"
  type        = number
}

variable "amplify_repository" {
  description = "GitHub repository URL for Amplify"
  type        = string
}

variable "amplify_branch" {
  description = "GitHub branch for Amplify deployment"
  type        = string
}

variable "amplify_access_token" {
  description = "GitHub access token for Amplify"
  type        = string
  sensitive   = true
}

variable "log_retention_days" {
  description = "CloudWatch log retention period in days"
  type        = number
}

variable "admin_email" {
  description = "Email for initial admin user"
  type        = string
  sensitive   = true
}

variable "admin_temp_password" {
  description = "Temporary password for admin user (must meet password policy requirements)"
  type        = string
  sensitive   = true
}

variable "ses_sender_email" {
  description = "Verified SES sender email used for task notification emails"
  type        = string
}

variable "ses_recipient_emails" {
  description = "Recipient emails to verify in SES for sandbox testing"
  type        = list(string)
  default     = []
}
