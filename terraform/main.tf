locals {
  common_tags = {
    Project     = var.project_name
    Environment = var.environment
  }
}

module "cognito" {
  source = "./modules/cognito"

  user_pool_name        = var.cognito_user_pool_name
  user_pool_client_name = var.cognito_client_name
  allowed_email_domains = var.allowed_email_domains
  project_name          = var.project_name
  environment           = var.environment
  admin_email           = var.admin_email
  admin_temp_password   = var.admin_temp_password
}

module "dynamodb" {
  source = "./modules/dynamodb"

  tasks_table_name       = var.tasks_table_name
  assignments_table_name = var.assignments_table_name
  project_name           = var.project_name
  environment            = var.environment
}

module "sns" {
  source = "./modules/sns"

  topic_name   = var.sns_topic_name
  project_name = var.project_name
  environment  = var.environment
}

module "ses" {
  source = "./modules/ses"

  sender_email     = var.ses_sender_email
  recipient_emails = var.ses_recipient_emails
}

module "iam" {
  source = "./modules/iam"

  project_name                 = var.project_name
  environment                  = var.environment
  tasks_table_arn              = module.dynamodb.tasks_table_arn
  assignments_table_arn        = module.dynamodb.assignments_table_arn
  tasks_table_stream_arn       = module.dynamodb.tasks_table_stream_arn
  assignments_table_stream_arn = module.dynamodb.assignments_table_stream_arn
  sns_topic_arn                = module.sns.topic_arn
  sns_kms_key_arn              = module.sns.kms_key_arn
  cognito_user_pool_arn        = module.cognito.user_pool_arn
}

module "lambda" {
  source = "./modules/lambda"

  project_name       = var.project_name
  environment        = var.environment
  runtime            = var.lambda_runtime
  timeout            = var.lambda_timeout
  memory_size        = var.lambda_memory_size
  log_retention_days = var.log_retention_days

  tasks_table_name             = module.dynamodb.tasks_table_name
  assignments_table_name       = module.dynamodb.assignments_table_name
  tasks_table_stream_arn       = module.dynamodb.tasks_table_stream_arn
  assignments_table_stream_arn = module.dynamodb.assignments_table_stream_arn
  sns_topic_arn                = module.sns.topic_arn

  lambda_role_arn         = module.iam.lambda_role_arn
  cognito_user_pool_id    = module.cognito.user_pool_id
  admin_email             = var.admin_email
  notification_from_email = module.ses.sender_email
}

module "api_gateway" {
  source = "./modules/api-gateway"

  api_name     = var.api_gateway_name
  stage_name   = var.api_gateway_stage
  project_name = var.project_name
  environment  = var.environment

  cognito_user_pool_arn = module.cognito.user_pool_arn

  create_task_invoke_arn   = module.lambda.create_task_invoke_arn
  update_task_invoke_arn   = module.lambda.update_task_invoke_arn
  update_status_invoke_arn = module.lambda.update_status_invoke_arn
  get_tasks_invoke_arn     = module.lambda.get_tasks_invoke_arn
  assign_task_invoke_arn   = module.lambda.assign_task_invoke_arn
  close_task_invoke_arn    = module.lambda.close_task_invoke_arn

  create_task_function_name   = module.lambda.create_task_function_name
  update_task_function_name   = module.lambda.update_task_function_name
  update_status_function_name = module.lambda.update_status_function_name
  get_tasks_function_name     = module.lambda.get_tasks_function_name
  assign_task_function_name   = module.lambda.assign_task_function_name
  close_task_function_name    = module.lambda.close_task_function_name
  get_users_invoke_arn        = module.lambda.get_users_invoke_arn
  get_users_function_name     = module.lambda.get_users_function_name
}

module "amplify" {
  source = "./modules/amplify"

  app_name     = "${var.project_name}-frontend"
  repository   = var.amplify_repository
  branch       = var.amplify_branch
  access_token = var.amplify_access_token
  project_name = var.project_name
  environment  = var.environment

  cognito_user_pool_id = module.cognito.user_pool_id
  cognito_client_id    = module.cognito.client_id
  api_gateway_endpoint = module.api_gateway.api_endpoint
  aws_region           = var.aws_region
}
