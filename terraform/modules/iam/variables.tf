variable "project_name" {
  description = "Project name for resource naming"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "tasks_table_arn" {
  description = "Tasks DynamoDB table ARN"
  type        = string
}

variable "assignments_table_arn" {
  description = "Assignments DynamoDB table ARN"
  type        = string
}

variable "tasks_table_stream_arn" {
  description = "Tasks DynamoDB stream ARN"
  type        = string
}

variable "assignments_table_stream_arn" {
  description = "Assignments DynamoDB stream ARN"
  type        = string
}

variable "sns_topic_arn" {
  description = "SNS topic ARN"
  type        = string
}

variable "sns_kms_key_arn" {
  description = "KMS key ARN used by SNS topic encryption"
  type        = string
}

variable "cognito_user_pool_arn" {
  description = "Cognito User Pool ARN"
  type        = string
}
