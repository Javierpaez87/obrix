import { Handler } from '@netlify/functions';

export const handler: Handler = async (event) => {
  const report = {
    month: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
    metrics: {
      active_projects: 12,
      new_tasks: 45,
      completion_rate: 87,
      on_time_percentage: 92
    },
    generated_at: new Date().toISOString()
  };

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(report)
  };
};
