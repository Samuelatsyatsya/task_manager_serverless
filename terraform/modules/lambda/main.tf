resource "aws_lambda_function" "create_task" {
  filename         = data.archive_file.create_task.output_path
  function_name    = "${var.project_name}-create-task"
  role             = var.lambda_role_arn
  handler          = "index.handler"
  source_code_hash = data.archive_file.create_task.output_base64sha256
  runtime          = var.runtime
  timeout          = var.timeout
  memory_size      = var.memory_size

  environment {
    variables = {
      TASKS_TABLE = var.tasks_table_name
    }
  }

  tracing_config {
    mode = "Active"
  }
}

resource "aws_lambda_function" "update_task" {
  filename         = data.archive_file.update_task.output_path
  function_name    = "${var.project_name}-update-task"
  role             = var.lambda_role_arn
  handler          = "index.handler"
  source_code_hash = data.archive_file.update_task.output_base64sha256
  runtime          = var.runtime
  timeout          = var.timeout
  memory_size      = var.memory_size

  environment {
    variables = {
      TASKS_TABLE = var.tasks_table_name
    }
  }

  tracing_config {
    mode = "Active"
  }
}

resource "aws_lambda_function" "update_status" {
  filename         = data.archive_file.update_status.output_path
  function_name    = "${var.project_name}-update-status"
  role             = var.lambda_role_arn
  handler          = "index.handler"
  source_code_hash = data.archive_file.update_status.output_base64sha256
  runtime          = var.runtime
  timeout          = var.timeout
  memory_size      = var.memory_size

  environment {
    variables = {
      TASKS_TABLE       = var.tasks_table_name
      ASSIGNMENTS_TABLE = var.assignments_table_name
    }
  }

  tracing_config {
    mode = "Active"
  }
}

resource "aws_lambda_function" "get_tasks" {
  filename         = data.archive_file.get_tasks.output_path
  function_name    = "${var.project_name}-get-tasks"
  role             = var.lambda_role_arn
  handler          = "index.handler"
  source_code_hash = data.archive_file.get_tasks.output_base64sha256
  runtime          = var.runtime
  timeout          = var.timeout
  memory_size      = var.memory_size

  environment {
    variables = {
      TASKS_TABLE       = var.tasks_table_name
      ASSIGNMENTS_TABLE = var.assignments_table_name
    }
  }

  tracing_config {
    mode = "Active"
  }
}

resource "aws_lambda_function" "assign_task" {
  filename         = data.archive_file.assign_task.output_path
  function_name    = "${var.project_name}-assign-task"
  role             = var.lambda_role_arn
  handler          = "index.handler"
  source_code_hash = data.archive_file.assign_task.output_base64sha256
  runtime          = var.runtime
  timeout          = var.timeout
  memory_size      = var.memory_size

  environment {
    variables = {
      TASKS_TABLE          = var.tasks_table_name
      ASSIGNMENTS_TABLE    = var.assignments_table_name
      COGNITO_USER_POOL_ID = var.cognito_user_pool_id
    }
  }

  tracing_config {
    mode = "Active"
  }
}

resource "aws_lambda_function" "close_task" {
  filename         = data.archive_file.close_task.output_path
  function_name    = "${var.project_name}-close-task"
  role             = var.lambda_role_arn
  handler          = "index.handler"
  source_code_hash = data.archive_file.close_task.output_base64sha256
  runtime          = var.runtime
  timeout          = var.timeout
  memory_size      = var.memory_size

  environment {
    variables = {
      TASKS_TABLE = var.tasks_table_name
    }
  }

  tracing_config {
    mode = "Active"
  }
}

resource "aws_lambda_function" "get_users" {
  filename         = data.archive_file.get_users.output_path
  function_name    = "${var.project_name}-get-users"
  role             = var.lambda_role_arn
  handler          = "index.handler"
  source_code_hash = data.archive_file.get_users.output_base64sha256
  runtime          = var.runtime
  timeout          = var.timeout
  memory_size      = var.memory_size

  environment {
    variables = {
      COGNITO_USER_POOL_ID = var.cognito_user_pool_id
    }
  }

  tracing_config {
    mode = "Active"
  }
}

resource "aws_lambda_function" "notify_handler" {
  filename         = data.archive_file.notify_handler.output_path
  function_name    = "${var.project_name}-notify-handler"
  role             = var.lambda_role_arn
  handler          = "index.handler"
  source_code_hash = data.archive_file.notify_handler.output_base64sha256
  runtime          = var.runtime
  timeout          = var.timeout
  memory_size      = var.memory_size

  environment {
    variables = {
      TASKS_TABLE          = var.tasks_table_name
      ASSIGNMENTS_TABLE    = var.assignments_table_name
      SNS_TOPIC_ARN        = var.sns_topic_arn
      COGNITO_USER_POOL_ID = var.cognito_user_pool_id
      ADMIN_EMAIL          = var.admin_email
    }
  }

  tracing_config {
    mode = "Active"
  }
}

resource "aws_lambda_function" "email_dispatcher" {
  filename         = data.archive_file.email_dispatcher.output_path
  function_name    = "${var.project_name}-email-dispatcher"
  role             = var.lambda_role_arn
  handler          = "index.handler"
  source_code_hash = data.archive_file.email_dispatcher.output_base64sha256
  runtime          = var.runtime
  timeout          = var.timeout
  memory_size      = var.memory_size

  environment {
    variables = {
      NOTIFICATION_FROM_EMAIL = var.notification_from_email
    }
  }

  tracing_config {
    mode = "Active"
  }
}

resource "aws_lambda_event_source_mapping" "notify_from_tasks_stream" {
  event_source_arn  = var.tasks_table_stream_arn
  function_name     = aws_lambda_function.notify_handler.arn
  starting_position = "LATEST"
}

resource "aws_lambda_event_source_mapping" "notify_from_assignments_stream" {
  event_source_arn  = var.assignments_table_stream_arn
  function_name     = aws_lambda_function.notify_handler.arn
  starting_position = "LATEST"
}

resource "aws_sns_topic_subscription" "email_dispatcher" {
  topic_arn = var.sns_topic_arn
  protocol  = "lambda"
  endpoint  = aws_lambda_function.email_dispatcher.arn
}

resource "aws_lambda_permission" "allow_sns_invoke_email_dispatcher" {
  statement_id  = "AllowSNSInvokeEmailDispatcher"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.email_dispatcher.function_name
  principal     = "sns.amazonaws.com"
  source_arn    = var.sns_topic_arn
}

resource "aws_cloudwatch_log_group" "create_task" {
  name              = "/aws/lambda/${aws_lambda_function.create_task.function_name}"
  retention_in_days = var.log_retention_days
}

resource "aws_cloudwatch_log_group" "update_task" {
  name              = "/aws/lambda/${aws_lambda_function.update_task.function_name}"
  retention_in_days = var.log_retention_days
}

resource "aws_cloudwatch_log_group" "update_status" {
  name              = "/aws/lambda/${aws_lambda_function.update_status.function_name}"
  retention_in_days = var.log_retention_days
}

resource "aws_cloudwatch_log_group" "get_tasks" {
  name              = "/aws/lambda/${aws_lambda_function.get_tasks.function_name}"
  retention_in_days = var.log_retention_days
}

resource "aws_cloudwatch_log_group" "assign_task" {
  name              = "/aws/lambda/${aws_lambda_function.assign_task.function_name}"
  retention_in_days = var.log_retention_days
}

resource "aws_cloudwatch_log_group" "close_task" {
  name              = "/aws/lambda/${aws_lambda_function.close_task.function_name}"
  retention_in_days = var.log_retention_days
}

resource "aws_cloudwatch_log_group" "get_users" {
  name              = "/aws/lambda/${aws_lambda_function.get_users.function_name}"
  retention_in_days = var.log_retention_days
}

resource "aws_cloudwatch_log_group" "notify_handler" {
  name              = "/aws/lambda/${aws_lambda_function.notify_handler.function_name}"
  retention_in_days = var.log_retention_days
}

resource "aws_cloudwatch_log_group" "email_dispatcher" {
  name              = "/aws/lambda/${aws_lambda_function.email_dispatcher.function_name}"
  retention_in_days = var.log_retention_days
}

data "archive_file" "create_task" {
  type        = "zip"
  output_path = "${path.module}/create_task.zip"
  source_dir  = "${path.module}/../../../lambda/create-task"
}

data "archive_file" "update_task" {
  type        = "zip"
  output_path = "${path.module}/update_task.zip"
  source_dir  = "${path.module}/../../../lambda/update-task"
}

data "archive_file" "update_status" {
  type        = "zip"
  output_path = "${path.module}/update_status.zip"
  source_dir  = "${path.module}/../../../lambda/update-status"
}

data "archive_file" "get_tasks" {
  type        = "zip"
  output_path = "${path.module}/get_tasks.zip"
  source_dir  = "${path.module}/../../../lambda/get-tasks"
}

data "archive_file" "assign_task" {
  type        = "zip"
  output_path = "${path.module}/assign_task.zip"
  source_dir  = "${path.module}/../../../lambda/assign-task"
}

data "archive_file" "close_task" {
  type        = "zip"
  output_path = "${path.module}/close_task.zip"
  source_dir  = "${path.module}/../../../lambda/close-task"
}

data "archive_file" "get_users" {
  type        = "zip"
  output_path = "${path.module}/get_users.zip"
  source_dir  = "${path.module}/../../../lambda/get-users"
}

data "archive_file" "notify_handler" {
  type        = "zip"
  output_path = "${path.module}/notify_handler.zip"
  source_dir  = "${path.module}/../../../lambda/notify-handler"
}

data "archive_file" "email_dispatcher" {
  type        = "zip"
  output_path = "${path.module}/email_dispatcher.zip"
  source_dir  = "${path.module}/../../../lambda/email-dispatcher"
}
