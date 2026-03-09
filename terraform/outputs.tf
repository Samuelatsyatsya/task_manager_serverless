output "cognito_user_pool_id" {
  description = "Cognito User Pool ID"
  value       = module.cognito.user_pool_id
}

output "cognito_client_id" {
  description = "Cognito User Pool Client ID"
  value       = module.cognito.client_id
}

output "api_gateway_endpoint" {
  description = "API Gateway endpoint URL"
  value       = module.api_gateway.api_endpoint
}

output "amplify_app_url" {
  description = "Amplify application URL"
  value       = module.amplify.app_url
}

output "tasks_table_name" {
  description = "DynamoDB tasks table name"
  value       = module.dynamodb.tasks_table_name
}

output "assignments_table_name" {
  description = "DynamoDB assignments table name"
  value       = module.dynamodb.assignments_table_name
}

output "sns_topic_arn" {
  description = "SNS topic ARN for notifications"
  value       = module.sns.topic_arn
}

output "ses_sender_email" {
  description = "SES sender email configured for Lambda notifications"
  value       = module.ses.sender_email
}

output "ses_sender_identity_arn" {
  description = "SES sender identity ARN"
  value       = module.ses.sender_identity_arn
}

output "ses_recipient_emails" {
  description = "SES sandbox recipient identities managed by Terraform"
  value       = module.ses.recipient_emails
}

output "ses_recipient_identity_arns" {
  description = "SES recipient identity ARNs managed by Terraform"
  value       = module.ses.recipient_identity_arns
}
