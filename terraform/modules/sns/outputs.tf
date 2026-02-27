output "topic_arn" {
  description = "SNS topic ARN"
  value       = aws_sns_topic.notifications.arn
}

output "topic_name" {
  description = "SNS topic name"
  value       = aws_sns_topic.notifications.name
}

output "kms_key_arn" {
  description = "KMS key ARN used for SNS topic encryption"
  value       = aws_kms_key.sns.arn
}
