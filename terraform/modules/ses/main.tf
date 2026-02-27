resource "aws_ses_email_identity" "sender" {
  email = var.sender_email
}

locals {
  recipient_identities = toset([
    for email in var.recipient_emails : trimspace(email)
    if trimspace(email) != "" && trimspace(email) != var.sender_email
  ])
}

resource "aws_ses_email_identity" "recipients" {
  for_each = local.recipient_identities
  email    = each.value
}
