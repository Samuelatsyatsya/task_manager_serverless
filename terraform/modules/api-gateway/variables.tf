variable "api_name" {
  description = "API Gateway name"
  type        = string
}

variable "stage_name" {
  description = "API Gateway stage name"
  type        = string
}

variable "project_name" {
  description = "Project name for tagging"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "cognito_user_pool_arn" {
  description = "Cognito User Pool ARN"
  type        = string
}

variable "create_task_invoke_arn" {
  description = "Create task Lambda invoke ARN"
  type        = string
}

variable "update_task_invoke_arn" {
  description = "Update task Lambda invoke ARN"
  type        = string
}

variable "update_status_invoke_arn" {
  description = "Update status Lambda invoke ARN"
  type        = string
}

variable "get_tasks_invoke_arn" {
  description = "Get tasks Lambda invoke ARN"
  type        = string
}

variable "assign_task_invoke_arn" {
  description = "Assign task Lambda invoke ARN"
  type        = string
}

variable "close_task_invoke_arn" {
  description = "Close task Lambda invoke ARN"
  type        = string
}

variable "create_task_function_name" {
  description = "Create task Lambda function name"
  type        = string
}

variable "update_task_function_name" {
  description = "Update task Lambda function name"
  type        = string
}

variable "update_status_function_name" {
  description = "Update status Lambda function name"
  type        = string
}

variable "get_tasks_function_name" {
  description = "Get tasks Lambda function name"
  type        = string
}

variable "assign_task_function_name" {
  description = "Assign task Lambda function name"
  type        = string
}

variable "close_task_function_name" {
  description = "Close task Lambda function name"
  type        = string
}

variable "get_users_invoke_arn" {
  description = "Get users Lambda invoke ARN"
  type        = string
}

variable "get_users_function_name" {
  description = "Get users Lambda function name"
  type        = string
}
