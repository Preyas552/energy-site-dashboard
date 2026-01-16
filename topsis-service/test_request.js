

async function test() {
    const payload = {
        "alternatives": [
            [
                { "lower": 1, "most_likely": 2, "upper": 3 },
                { "lower": 4, "most_likely": 5, "upper": 6 }
            ]
        ],
        "weights": [
            { "lower": 0.1, "most_likely": 0.2, "upper": 0.3 },
            { "lower": 0.4, "most_likely": 0.5, "upper": 0.6 }
        ],
        "criteria_types": [true, true]
    };

    try {
        const response = await fetch('http://localhost:5001/api/fuzzy-topsis/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        console.log('Status:', response.status);
        console.log('StatusText:', response.statusText);
        const text = await response.text();
        console.log('Body:', text);
    } catch (error) {
        console.error('Error:', error);
    }
}

test();
