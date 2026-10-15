import { processTranscript } from './transcriptService.js';

const rawData = `
[
    {
        "id": 101,
        "name": "Ali",
        "courses": [
            { "code": "CS301", "marks": 81 },
            { "code": "CS302", "marks": 74 }
        ]
    },
    {
        "id": 102,
        "name": "Sara",
        "courses": [
            { "code": "CS301", "marks": 91 },
            { "code": "CS302", "marks": 88 }
        ]
    }
]
`;

try {
    const report = processTranscript(rawData);

    console.log('Transcript Report Object:');
    console.log(report);

    const reportJSON = JSON.stringify(report, null, 2);

    console.log('\nTranscript Report JSON:');
    console.log(reportJSON);
} catch (error) {
    console.log('Transcript processing failed.');
    console.log(error.name + ': ' + error.message);
} finally {
    console.log('\nTranscript processing finished.');
}