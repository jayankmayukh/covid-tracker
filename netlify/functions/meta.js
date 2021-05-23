import data from '../../data.json';

export const handler = async ({ queryStringParameters: params }) => {
    let nameSource = data;
    if (Object.keys(params).length) {
        nameSource = params;
    }
    const countryNames = Object.keys(nameSource).filter((country) => country.length === 3);

    const timeseries = {};
    const countries = {};

    countryNames.forEach((country) => {
        countries[country] = { values: [], timeseries: [] };
        if (data[country]) {
            Object.keys(data[country]).forEach((key) => {
                if (key === 'data') return;
                countries[country].values.push(key);
            });
        }
        if (Array.isArray(data[country]?.data)) {
            data[country].data.forEach((point) => {
                Object.keys(point).forEach((key) => {
                    if (key === 'date') return;
                    if (!(key in timeseries)) {
                        timeseries[key] = [country];
                    } else if (!timeseries[key].includes(country)) {
                        timeseries[key].push(country);
                    }
                    if (!countries[country].timeseries.includes(key)) {
                        countries[country].timeseries.push(key);
                    }
                });
            });
        }
    });

    return {
        statusCode: 200,
        body: JSON.stringify({
            timeseries,
            countries,
        }),
    };
};
