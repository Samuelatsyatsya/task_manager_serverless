data "aws_caller_identity" "current" {}

resource "aws_sns_topic" "notifications" {
  name              = var.topic_name
  display_name      = "Task Management Notifications"
  kms_master_key_id = aws_kms_key.sns.id

  tags = {
    Name = var.topic_name
  }
}

resource "aws_kms_key" "sns" {
  description             = "KMS key for SNS topic encryption"
  deletion_window_in_days = 10
  enable_key_rotation     = true

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "Enable IAM User Permissions"
        Effect = "Allow"
        Principal = {
          AWS = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:root"
        }
        Action   = "kms:*"
        Resource = "*"
      },
      {
        Sid    = "Allow SNS to use the key"
        Effect = "Allow"
        Principal = {
          Service = "sns.amazonaws.com"
        }
        Action = [
          "kms:Decrypt",
          "kms:GenerateDataKey"
        ]
        Resource = "*"
      }
    ]
  })
}

resource "aws_kms_alias" "sns" {
  name          = "alias/${var.project_name}-sns"
  target_key_id = aws_kms_key.sns.key_id
}
