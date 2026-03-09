# resource "aws_cognito_user_pool" "main" {
#   name = var.user_pool_name

#   username_attributes      = ["email"]
#   auto_verified_attributes = ["email"]

#   password_policy {
#     minimum_length                   = 8
#     require_lowercase                = true
#     require_numbers                  = true
#     require_symbols                  = true
#     require_uppercase                = true
#     temporary_password_validity_days = 7
#   }

#   schema {
#     name                = "email"
#     attribute_data_type = "String"
#     required            = true
#     mutable             = false

#     string_attribute_constraints {
#       min_length = 1
#       max_length = 256
#     }
#   }

#   schema {
#     name                = "role"
#     attribute_data_type = "String"
#     required            = false
#     mutable             = true
#     developer_only_attribute = false

#     string_attribute_constraints {
#       min_length = 1
#       max_length = 20
#     }
#   }

#   # Lambda configuration block 
#   lambda_config {
#     pre_sign_up = aws_lambda_function.pre_signup.arn
#   }

#   email_configuration {
#     email_sending_account = "COGNITO_DEFAULT"
#   }

#   verification_message_template {
#     default_email_option = "CONFIRM_WITH_CODE"
#     email_subject        = "Your verification code"
#     email_message        = "Your verification code is {####}"
#   }

#   account_recovery_setting {
#     recovery_mechanism {
#       name     = "verified_email"
#       priority = 1
#     }
#   }

#   user_pool_add_ons {
#     advanced_security_mode = "ENFORCED"
#   }

#   tags = {
#     Name = var.user_pool_name
#   }
# }

# resource "aws_cognito_user_pool_client" "main" {
#   name         = var.user_pool_client_name
#   user_pool_id = aws_cognito_user_pool.main.id

#   generate_secret                      = false
#   refresh_token_validity               = 30
#   access_token_validity                = 60
#   id_token_validity                    = 60
#   token_validity_units {
#     refresh_token = "days"
#     access_token  = "minutes"
#     id_token      = "minutes"
#   }

#   explicit_auth_flows = [
#     "ALLOW_USER_SRP_AUTH",
#     "ALLOW_REFRESH_TOKEN_AUTH",
#     "ALLOW_USER_PASSWORD_AUTH"
#   ]

#   read_attributes = [
#     "email",
#     "email_verified",
#     "custom:role"
#   ]

#   write_attributes = [
#     "email",
#     "custom:role"
#   ]

#   prevent_user_existence_errors = "ENABLED"
# }

# resource "aws_cognito_user_pool_domain" "main" {
#   domain       = "${var.project_name}-${var.environment}"
#   user_pool_id = aws_cognito_user_pool.main.id
# }

# # Lambda for Pre-signup validation
# resource "aws_lambda_function" "pre_signup" {
#   filename         = data.archive_file.pre_signup.output_path
#   function_name    = "${var.project_name}-pre-signup-validation"
#   role            = aws_iam_role.pre_signup_lambda.arn
#   handler         = "index.handler"
#   source_code_hash = data.archive_file.pre_signup.output_base64sha256
#   runtime         = "python3.11"
#   timeout         = 10

#   environment {
#     variables = {
#       ALLOWED_DOMAINS = join(",", var.allowed_email_domains)
#     }
#   }
# }

# data "archive_file" "pre_signup" {
#   type        = "zip"
#   output_path = "${path.module}/pre_signup.zip"

#   source {
#     content  = <<EOF
# import json
# import os

# def handler(event, context):
#     allowed_domains = os.environ['ALLOWED_DOMAINS'].split(',')
#     email = event['request']['userAttributes']['email']
#     domain = email.split('@')[1]

#     if domain not in allowed_domains:
#         raise Exception(f"Email domain {domain} is not allowed. Only {', '.join(allowed_domains)} are permitted.")

#     event['response']['autoConfirmUser'] = False
#     event['response']['autoVerifyEmail'] = False

#     return event
# EOF
#     filename = "index.py"
#   }
# }

# resource "aws_iam_role" "pre_signup_lambda" {
#   name = "${var.project_name}-pre-signup-lambda-role"

#   assume_role_policy = jsonencode({
#     Version = "2012-10-17"
#     Statement = [{
#       Action = "sts:AssumeRole"
#       Effect = "Allow"
#       Principal = {
#         Service = "lambda.amazonaws.com"
#       }
#     }]
#   })
# }

# resource "aws_iam_role_policy_attachment" "pre_signup_lambda_basic" {
#   policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
#   role       = aws_iam_role.pre_signup_lambda.name
# }

# resource "aws_lambda_permission" "cognito_pre_signup" {
#   statement_id  = "AllowCognitoInvoke"
#   action        = "lambda:InvokeFunction"
#   function_name = aws_lambda_function.pre_signup.function_name
#   principal     = "cognito-idp.amazonaws.com"
#   source_arn    = aws_cognito_user_pool.main.arn
# }



resource "aws_cognito_user_pool" "main" {
  name = var.user_pool_name

  username_attributes      = ["email"]
  auto_verified_attributes = ["email"]

  password_policy {
    minimum_length                   = 8
    require_lowercase                = true
    require_numbers                  = true
    require_symbols                  = true
    require_uppercase                = true
    temporary_password_validity_days = 7
  }

  schema {
    name                     = "role"
    attribute_data_type      = "String"
    required                 = false
    mutable                  = true
    developer_only_attribute = false

    string_attribute_constraints {
      min_length = 1
      max_length = 20
    }
  }

  lambda_config {
    pre_sign_up = aws_lambda_function.pre_signup.arn
  }

  email_configuration {
    email_sending_account = "COGNITO_DEFAULT"
  }

  verification_message_template {
    default_email_option = "CONFIRM_WITH_CODE"
    email_subject        = "Your verification code"
    email_message        = "Your verification code is {####}"
  }

  account_recovery_setting {
    recovery_mechanism {
      name     = "verified_email"
      priority = 1
    }
  }

  user_pool_add_ons {
    advanced_security_mode = "ENFORCED"
  }

  tags = {
    Name = var.user_pool_name
  }

}

resource "aws_cognito_user_pool_client" "main" {
  name         = var.user_pool_client_name
  user_pool_id = aws_cognito_user_pool.main.id

  generate_secret        = false
  refresh_token_validity = 30
  access_token_validity  = 60
  id_token_validity      = 60
  token_validity_units {
    refresh_token = "days"
    access_token  = "minutes"
    id_token      = "minutes"
  }

  explicit_auth_flows = [
    "ALLOW_USER_SRP_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH",
    "ALLOW_USER_PASSWORD_AUTH"
  ]

  prevent_user_existence_errors        = "ENABLED"
  allowed_oauth_flows_user_pool_client = false
}

resource "aws_cognito_user_pool_domain" "main" {
  domain       = "${var.project_name}-${var.environment}"
  user_pool_id = aws_cognito_user_pool.main.id
}

# Admin Group
resource "aws_cognito_user_group" "admin" {
  name         = "admin"
  user_pool_id = aws_cognito_user_pool.main.id
  description  = "Administrator group"
  precedence   = 1
}

# Member Group
resource "aws_cognito_user_group" "member" {
  name         = "member"
  user_pool_id = aws_cognito_user_pool.main.id
  description  = "Member group"
  precedence   = 10
}

# Initial Admin User
resource "aws_cognito_user" "admin" {
  user_pool_id = aws_cognito_user_pool.main.id
  username     = var.admin_email

  attributes = {
    email          = var.admin_email
    email_verified = true
    "custom:role"  = "admin"
  }

  temporary_password = var.admin_temp_password

  lifecycle {
    ignore_changes = [
      temporary_password,
      attributes["email_verified"]
    ]
  }
}

# Add Admin User to Admin Group
resource "aws_cognito_user_in_group" "admin_membership" {
  user_pool_id = aws_cognito_user_pool.main.id
  group_name   = aws_cognito_user_group.admin.name
  username     = aws_cognito_user.admin.username
}

# Lambda for Pre-signup validation
resource "aws_lambda_function" "pre_signup" {
  filename         = data.archive_file.pre_signup.output_path
  function_name    = "${var.project_name}-pre-signup-validation"
  role             = aws_iam_role.pre_signup_lambda.arn
  handler          = "index.handler"
  source_code_hash = data.archive_file.pre_signup.output_base64sha256
  runtime          = "python3.11"
  timeout          = 10

  environment {
    variables = {
      ALLOWED_DOMAINS = join(",", var.allowed_email_domains)
    }
  }
}

data "archive_file" "pre_signup" {
  type        = "zip"
  output_path = "${path.module}/pre_signup.zip"

  source {
    content  = <<EOF
import json
import os

def handler(event, context):
    allowed_domains = os.environ['ALLOWED_DOMAINS'].split(',')
    email = event['request']['userAttributes']['email']
    
    if '@' not in email or email.count('@') != 1:
        raise Exception("Invalid email format")
    
    domain = email.split('@')[1]
    
    if domain not in allowed_domains:
        raise Exception(f"Email domain {domain} is not allowed. Only {', '.join(allowed_domains)} are permitted.")
    
    event['response']['autoConfirmUser'] = False
    event['response']['autoVerifyEmail'] = False
    
    return event
EOF
    filename = "index.py"
  }
}

resource "aws_iam_role" "pre_signup_lambda" {
  name = "${var.project_name}-pre-signup-lambda-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "lambda.amazonaws.com"
      }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "pre_signup_lambda_basic" {
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
  role       = aws_iam_role.pre_signup_lambda.name
}

resource "aws_lambda_permission" "cognito_pre_signup" {
  statement_id  = "AllowCognitoInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.pre_signup.function_name
  principal     = "cognito-idp.amazonaws.com"
  source_arn    = aws_cognito_user_pool.main.arn
}
