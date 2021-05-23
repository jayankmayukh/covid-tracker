import data from '../../data.json';

export const handler = async ({ queryStringParameters: params }) => {
	const { country, code } = params;
	if (data[country]?.[code]) {
		return {
			statusCode: 200,
			body: JSON.stringify({ value: data[country][code] }),
		}
	}

    return {
        statusCode: 400,
        body: JSON.stringify({ message: 'invalid input.', input: params }),
    };
};
