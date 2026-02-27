output "sender_email" {
  description = "Configured SES sender email"
  value       = aws_ses_email_identity.sender.email
}

output "sender_identity_arn" {
  description = "ARN of the SES sender identity"
  value       = aws_ses_email_identity.sender.arn
}

output "recipient_emails" {
  description = "SES recipient identities configured for sandbox delivery"
  value       = sort([for identity in aws_ses_email_identity.recipients : identity.email])
}

output "recipient_identity_arns" {
  description = "SES recipient identity ARNs configured for sandbox delivery"
  value       = { for email, identity in aws_ses_email_identity.recipients : email => identity.arn }
}
