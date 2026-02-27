output "app_id" {
  description = "Amplify app ID"
  value       = aws_amplify_app.main.id
}

output "app_url" {
  description = "Amplify app URL"
  value       = "https://${aws_amplify_branch.main.branch_name}.${aws_amplify_app.main.default_domain}"
}

output "webhook_url" {
  description = "Amplify webhook URL"
  value       = aws_amplify_webhook.main.url
  sensitive   = true
}
