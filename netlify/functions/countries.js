import data from '../../data.json';

export const handler = async () => {
    const getTotalCases = (c) => data[c].data[data[c].data.length - 1].total_cases ?? 0;
    const countries = Object.keys(data)
        .filter((name) => name.length === 3)
        .sort((a, b) => getTotalCases(b) - getTotalCases(a));
    return {
        statusCode: 200,
        body: JSON.stringify(countries),
    };
};
