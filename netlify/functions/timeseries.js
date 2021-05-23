import data from '../../data.json'

export const handler = async ({ queryStringParameters: params }) => {
    const { country, code } = params
    if (Array.isArray(data[country]?.data)) {
        return {
            statusCode: 200,
            body: JSON.stringify(data[country].data),
        }
    }

    return {
        statusCode: 400,
        body: JSON.stringify({ message: 'invalid input.', input: params }),
    }
}
