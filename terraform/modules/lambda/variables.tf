variable "project_name" {
  description = "Project name for resource naming"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "runtime" {
  description = "Lambda runtime"
  type        = string
}

variable "timeout" {
  description = "Lambda timeout in seconds"
  type        = number
}

variable "memory_size" {
  description = "Lambda memory size in MB"
  type        = number
}

variable "log_retention_days" {
  description = "CloudWatch log retention in days"
  type        = number
}

variable "tasks_table_name" {
  description = "Tasks table name"
  type        = string
}

variable "assignments_table_name" {
  description = "Assignments table name"
  type        = string
}

variable "tasks_table_stream_arn" {
  description = "Tasks table stream ARN"
  type        = string
}

variable "assignments_table_stream_arn" {
  description = "Assignments table stream ARN"
  type        = string
}

variable "sns_topic_arn" {
  description = "SNS topic ARN"
  type        = string
}

variable "lambda_role_arn" {
  description = "Lambda execution role ARN"
  type        = string
}

variable "cognito_user_pool_id" {
  description = "Cognito User Pool ID"
  type        = string
}

variable "admin_email" {
  description = "Admin email used for notifications"
  type        = string
}

variable "notification_from_email" {
  description = "Verified SES sender address used for outgoing notification emails"
  type        = string
}
