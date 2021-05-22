import { Handler } from "@netlify/functions";
import data from '../../codebook.json';

const handler: Handler = async (event, context) => {
  return {
    statusCode: 200,
    body: JSON.stringify(data),
  };
};

export { handler };
