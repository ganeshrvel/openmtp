import process from 'process';

export const { WORKFLOW_ENV } = process.env;

export const WORKFLOW_ENV_DEV = 'dev';
export const WORKFLOW_ENV_PROD = 'prod';

export const IS_DEV_WORKFLOW = WORKFLOW_ENV === WORKFLOW_ENV_DEV;
export const IS_PROD_WORKFLOW = WORKFLOW_ENV === WORKFLOW_ENV_PROD;
