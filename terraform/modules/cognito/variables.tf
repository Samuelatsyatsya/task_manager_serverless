variable "user_pool_name" {
  description = "Name for the Cognito User Pool"
  type        = string
}

variable "user_pool_client_name" {
  description = "Name for the Cognito User Pool Client"
  type        = string
}

variable "allowed_email_domains" {
  description = "List of allowed email domains"
  type        = list(string)
}

variable "project_name" {
  description = "Project name for tagging"
  type        = string
}

variable "environment" {
  description = "Environment name for tagging"
  type        = string
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
