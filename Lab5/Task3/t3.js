const student = {
    id: 101,
    name: 'Ali',
    marks: 0,
    scholarship: false,
    address: {
        city: 'Islamabad',
        sector: 'F-10'
    },
    contact: {
        email: 'ali@university.edu'
    }
};

const update = {
    name: 'Ali Khan',
    address: {
        city: 'Rawalpindi'
    },
    contact: {
        phone: '03001234567'
    }
};

function updateProfile(currentStudent, updateRequest = {}) {
    if (
        currentStudent === null ||
        typeof currentStudent !== 'object' ||
        Array.isArray(currentStudent)
    ) {
        throw new TypeError('Invalid student object');
    }

    if (
        updateRequest === null ||
        typeof updateRequest !== 'object' ||
        Array.isArray(updateRequest)
    ) {
        throw new TypeError('Invalid update object');
    }

    // Object destructuring and object rest
    const {
        address: addressUpdate = {},
        contact: contactUpdate = {},
        ...otherUpdates
    } = updateRequest;

   
    const {
        address: {
            city: updatedCity = currentStudent.address?.city
        } = {}
    } = {
        address: updateRequest.address ?? {}
    };

    const updatedAddress = {
        ...(currentStudent.address ?? {}),
        ...(addressUpdate ?? {}),
        city: updatedCity
    };


    const updatedContact = {
        ...(currentStudent.contact ?? {}),
        ...(contactUpdate ?? {})
    };

    // Property shorthand
    const updatedStudent = {
        ...currentStudent,
        ...otherUpdates,
        address: updatedAddress,
        contact: updatedContact
    };

    return updatedStudent;
}

const updatedStudent = updateProfile(student, update);

console.log('Original Student:');
console.log(student);

console.log('Updated Student:');
console.log(updatedStudent);


// Reference comparison challenge

const [originalLabel, updatedLabel] = ['Original', 'Updated'];

function compareReferences(...comparisons) {
    comparisons.forEach(comparison => {
        console.log(
            comparison.label + ':',
            comparison.first === comparison.second
        );
    });
}

compareReferences(
    {
        label: originalLabel + ' object === ' + updatedLabel + ' object',
        first: student,
        second: updatedStudent
    },
    {
        label: 'Original address === Updated address',
        first: student.address,
        second: updatedStudent.address
    },
    {
        label: 'Original contact === Updated contact',
        first: student.contact,
        second: updatedStudent.contact
    }
);


// Testing valid falsy values

const falsyUpdate = {
    marks: 0,
    scholarship: false,
    name: ''
};

const falsyResult = updateProfile(student, falsyUpdate);

console.log('Falsy Values Test:');
console.log('Marks:', falsyResult.marks);
console.log('Scholarship:', falsyResult.scholarship);
console.log('Name:', JSON.stringify(falsyResult.name));


// Optional chaining and nullish coalescing

const phone = updatedStudent.contact?.phone ?? 'No phone provided';

console.log('Phone:', phone);


// Object destructuring with default values and renaming
const {
    name: studentName = 'Unknown Student',
    marks: studentMarks = 0
} = updatedStudent;

console.log('Student Name:', studentName);
console.log('Student Marks:', studentMarks);


// Rest parameters and array destructuring demonstration
function showProfileFields(...fields) {
    const [firstField, secondField = 'marks'] = fields;

    console.log('First field:', firstField);
    console.log('Second field:', secondField);
}

showProfileFields('name');